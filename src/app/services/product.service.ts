import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    private productUrl = 'http://localhost:9090/api/products';
    private categoryUrl = 'http://localhost:9090/api/product-category';

    constructor(private httpClient: HttpClient) { }

    public getCategories() : Observable <ProductCategory[]> {
      return this.httpClient.get<GetResponseCategory>(this.categoryUrl).pipe(
        map(response => response._embedded.productCategory)
      );
    }

    public getProductList(categoryId: number): Observable<Product[]> {
      const url = `${this.productUrl}/search/findByCategoryId?id=${categoryId}`;
      return this.getProducts(url);
    }

    public searchProducts(theKeyword: string): Observable<Product[]> {
      const url = `${this.productUrl}/search/findByNameContaining?name=${theKeyword}`;
      return this.getProducts(url);
    }

    public getProduct(theProductId: number): Observable<Product>{
      const url = `${this.productUrl}/${theProductId}`;
      return this.httpClient.get<Product>(url);
    }

    private getProducts(searchUrl: string): Observable<Product[]>{
      return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
        map(response => response._embedded.products)
      );
    }

    public getProductListPaginate(thePage: number,
                                  thePageSize: number,
                                  categoryId: number): Observable<GetResponseProducts> {
      const url = `${this.productUrl}/search/findByCategoryId?id=${categoryId}` +
                  `&page=${thePage}&size=${thePageSize}`;
      
      return this.httpClient.get<GetResponseProducts>(url);
    }

    public searchProductsPaginate(thePage: number,
                                  thePageSize: number,
                                  theKeyword: string): Observable<GetResponseProducts>{

      //  Need to build URL based on keyword, page and size
      const url = `${this.productUrl}/search/findByNameContaining`+
                  `?name=${theKeyword}&page=${thePage}&size=${thePageSize}`;

      return this.httpClient.get<GetResponseProducts>(url);
    }

}

interface GetResponseCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }  
}