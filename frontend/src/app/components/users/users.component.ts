import { ItemService } from './../../services/item.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink,NgIf,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{
private ItemService =inject(ItemService);
  searchControl = new FormControl('');


constructor(
  private router: Router,
  private route  : ActivatedRoute,
){}

users: any[] = [];
totalitems =0 ;

ngOnInit () : void {
  this.loadusers();
}


 loadusers(){
  this.ItemService.getusers().subscribe
   ({
    next: (data : any) =>{
     console.log("Items are :", data );
      this.users= data;

    // console.log("Items are :",this.users );
    },
    error:(error) => {
      console.error("Error in fetching items :", error);
    }

   });
}
}
