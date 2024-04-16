import { Component, OnInit } from '@angular/core';
import { ProductService } from './../../services/product.service';
import { ProductCategory } from '../../common/product-category';

@Component({
  selector: 'product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css']
})
export class ProductCategoryMenuComponent implements OnInit {

  categories: ProductCategory[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.listCategories();
  }

  listCategories(): void{
    this.productService.getCategories().subscribe(
      data => {
        this.categories = data;
      }
    );
  }

}
