import { CartService } from 'src/app/services/cart.service';
import { Country } from './../../common/country';
import { CheckoutService } from './../../services/checkout.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { State } from '../../common/state';
import { CustomValidators } from 'src/app/common/custom-validators';
import { Router } from '@angular/router';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  
  totalPrice: number = 0;
  totalQuantity: number = 0;
  checkoutFormGroup!: FormGroup;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  states: State[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, 
              private checkoutService: CheckoutService,
              private cartService: CartService,
              private router: Router) { }

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, 
                                        Validators.minLength(3), 
                                        CustomValidators.invalidSpaceChars]),
        lastName: new FormControl('', [Validators.required, 
                                       Validators.minLength(3), 
                                       CustomValidators.invalidSpaceChars]),
        email: new FormControl('', [Validators.required, 
                                    Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, 
                                     Validators.minLength(3), 
                                     CustomValidators.invalidSpaceChars]),
        city: new FormControl('', [Validators.required, 
                                   Validators.minLength(3), 
                                   CustomValidators.invalidSpaceChars]),
        state: new FormControl('', [Validators.required, 
                                    CustomValidators.invalidSpaceChars]),
        country: new FormControl('', [Validators.required, 
                                      CustomValidators.invalidSpaceChars]),
        zipCode: new FormControl('', [Validators.required, 
                                      Validators.minLength(4), 
                                      CustomValidators.invalidSpaceChars])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, 
                                     Validators.minLength(3), 
                                     CustomValidators.invalidSpaceChars]),
        city: new FormControl('', [Validators.required, 
                                   Validators.minLength(3), 
                                   CustomValidators.invalidSpaceChars]),
        state: new FormControl('', [Validators.required, 
                                    CustomValidators.invalidSpaceChars]),
        country: new FormControl('', [Validators.required, 
                                      CustomValidators.invalidSpaceChars]),
        zipCode: new FormControl('', [Validators.required, 
                                      Validators.minLength(4), 
                                      CustomValidators.invalidSpaceChars])
      }),
      creditCard: this.formBuilder.group({ 
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, 
                                         Validators.minLength(4), 
                                         CustomValidators.invalidSpaceChars]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: new FormControl('', [Validators.required, 
                                              CustomValidators.invalidSpaceChars]),
        expirationYear: new FormControl('', [Validators.required, 
                                             CustomValidators.invalidSpaceChars])
      })
    });

    // populate credit card month
    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);

    this.checkoutService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.checkoutService.getCreditCardYears().subscribe(
      data => {
        console.log('Retrieved credit card years: ' + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // populate countries
    this.checkoutService.getCountries().subscribe(
      data => {
        console.log('Retrieved countries: ' + JSON.stringify(data));
        this.countries = data;
      }
    );
  }

  reviewCartDetails(): void{
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

  onSubmit(): void{
    console.log('Handling the submit button');

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long away
    /*let orderItems: OrderItem[] = [];
    for(let i = 0; i < cartItems.length; i++){
      orderItems[i] = new OrderItem(cartItems[i]);
    }*/

    // - short away of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;    

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;  

    // populate puchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.messge}`);
        }
      }
    );

    //console.log(this.checkoutFormGroup.get('customer')?.value);
    //console.log("The email address is " + this.checkoutFormGroup.get('customer').value.email);
    //console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress').value.country);
    //console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress').value.state);
  }

  resetCart(): void{
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset;

    // navigate back to the products page
    this.router.navigateByUrl('/products');
  }

  copyShippingAddressToBillingAddress(event: any): void{
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears(): void{
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // if the current year equals the selected year, then start with current month

    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.checkoutService.getCreditCardMonths(startMonth).subscribe(
      data => {
          console.log('Retrieved credit card months: ' + JSON.stringify(data));
          this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string): void{
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    this.checkoutService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else{
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }


  /*** Getter validation methods ***/
  
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }  

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get creditCardExpirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get creditCardExpirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear'); }
}
