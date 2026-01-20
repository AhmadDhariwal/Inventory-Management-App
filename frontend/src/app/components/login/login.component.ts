// import { Component, inject } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// import { ItemService } from '../../services/item.service';
// import { FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
// import { FormControl,FormGroup } from '@angular/forms';
// import { Route,ActivatedRoute } from '@angular/router';
// import { NgIf } from '@angular/common';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [RouterLink,NgIf,FormsModule,ReactiveFormsModule],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent {
//     private ItemService = inject(ItemService);


//        items: any = [];
//         // userid: string | null = null;

//           constructor(
//             private router: Router,
//             private route : ActivatedRoute,

//           ) {}

//             userForm = new FormGroup({


//           username: new FormControl('',[
//               Validators.required,
//               Validators.min(8),
//               Validators.max(100),



//           ]),
//           password : new FormControl('',[
//              Validators.required,
//              //Validators.minLength(8),
//               Validators.maxLength(250),
//               Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
//           ]),

//          })

//       message = '';
//          submitted = false;
//      ngOnInit(): void {
//        console.log("hello world");
//      }

//       password : string = '';
//       show : boolean = false;
//       toggleShow(){
//         this.show = !this.show;
//       }


//      onsubmit(){

//         this.submitted = true;

//      if (this.userForm.invalid) {
//        this.message = "Please fill in all required fields correctly";
//        return;
//      }
//      this.message = '';
//             this.items =this.userForm.value;

//            this.ItemService.userlogin(this.items).subscribe(
//           {
//            next:(response: any) => {
//              console.log("User login successfully" , response);
//              this.userForm.reset();
//              if (response.token) {
//                localStorage.setItem('token', response.token);
//              }
//              this.router.navigate(['homepage']);

//            },
//            error:(error) => {
//              console.error("Error in login", error);
//              this.message = "Invalid username or password";
//              this.userForm.reset();
//            }
//           }
//            )
//          }

//         }


