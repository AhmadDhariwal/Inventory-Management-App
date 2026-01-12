import { ItemService } from './../../services/item.service';
import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Validators } from '@angular/forms';
import { FormControl,FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-singup',
  standalone: true,
  imports: [RouterLink,FormsModule,ReactiveFormsModule,CommonModule,NgIf],
  templateUrl: './singup.component.html',
  styleUrl: './singup.component.scss'
})
export class SingupComponent implements OnInit{
   private ItemService = inject(ItemService);


    items: any = [];
     // userid: string | null = null;

       constructor(
         private router: Router,
         private route : ActivatedRoute
       ) {}

         userForm = new FormGroup({
       name: new FormControl('' , [
         Validators.required,
         Validators.minLength(7),
         Validators.maxLength(50),
         Validators.pattern(/^[a-zA-Z]+$/)


       ]),

           email : new FormControl('',[
           Validators.required,
           Validators.email

           ]),


       username: new FormControl('',[
           Validators.required,
           Validators.min(8),
           Validators.max(100),

       ]),
       password : new FormControl('',[
          Validators.required,
          //Validators.minLength(8),
           Validators.maxLength(250),
           Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
       ]),

       role :  new FormControl('',[
       Validators.required,
    ]),


      })

      submitted = false;
  ngOnInit(): void {
    console.log("hello world");
  }


  password : string = '';
      show : boolean = false;
      toggleShow(){
        this.show = !this.show;
      }

  onsubmit(){
   
     this.submitted = true;

  if (this.userForm.invalid) {
    return;
  }
      this.items=this.userForm.value;

        this.ItemService.usersignup(this.items).subscribe(
       {
        next:(response) => {
          console.log("User Signed up successfully" , response);
          this.userForm.reset();
          this.router.navigate(['inventory/all']);
        },
        error:(error) => {
          console.error("Error in signing up", error);
        }
       }
        )
      }

   }

