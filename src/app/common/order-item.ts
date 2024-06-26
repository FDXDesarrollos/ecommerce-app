import { CartItem } from "./cart-item";

export class OrderItem {
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: number;

    constructor(cartItem: CartItem){
        this.productId = cartItem.id;
        this.unitPrice = cartItem.unitPrice;
        this.quantity = cartItem.quantity;
        this.imageUrl = cartItem.imageUrl;
    }
}
