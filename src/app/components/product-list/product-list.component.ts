import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  categoryId: number = 1;
  previousCategoryId: number = 1;
  categoryName: string = '';
  searchMode: boolean = false;

  //  New properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 1;
  previousKeyword: string = '';

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts(): void {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode)
      this.handleSearchProducts();
    else
      this.handleListProducts();
    
  }

  handleSearchProducts(): void {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;
    
    // if we have a different keyword than previous then set thePageNumber to 1
    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;
    
    //  Now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               theKeyword).subscribe( this.processResult() );
  }

  handleListProducts(): void {
    // Check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      // Get the "id" param string. convert string to a number using the "+" symbol
      this.categoryId = Number(this.route.snapshot.paramMap.get('id'))!;

      // get the "name" param string
      this.categoryName = this.route.snapshot.paramMap.get('name')!;      
    }
    else{
      this.categoryId = 1;
      this.categoryName = 'Books';
    }

    //  
    //  Check if we have a different category then previous
    //  Note: Angular will reuse a component if it is currently being viewed
    //  

    //  If we have a different category id than previous
    //  then set thePageNumber back to 1
    if(this.previousCategoryId != this.categoryId)
      this.thePageNumber = 1;
    else
      this.previousCategoryId = this.categoryId;

    console.log('categoryId=' + this.categoryId + ' - ' + 'thePageNumber=' + this.thePageNumber);

    //  Now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber -1, 
                                               this.thePageSize, 
                                               this.categoryId).subscribe( this.processResult() );
  }

  updatePageSize(pageSize: string): void {
      this.thePageNumber = 1;
      this.thePageSize = Number(pageSize);
      this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(theProduct: Product){
      console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
      this.cartService.addToCart( new CartItem(theProduct) );
  }

}
