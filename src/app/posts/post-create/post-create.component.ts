import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PostService } from "../post.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Post } from "../post.model";
import { mimeType } from "../mime-type.validator";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit, OnDestroy {
  mode = 'create';
  postId: string;
  post: Post;
  isLoading = false;
  authStatusSub: Subscription;
  createPostFG: FormGroup;
  imagePreview: string | ArrayBuffer = null;
  @ViewChild('filePicker') filePicker: ElementRef;

  constructor(public postsService: PostService, public route: ActivatedRoute, private router: Router, public authSer: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authSer.authStatusListener.subscribe((authStatus) => {
      this.isLoading = false;
    });
    this.createPostFG = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(75)]),
      content: new FormControl('', [Validators.required]),
      image: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [mimeType],
        updateOn: 'change'
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postID')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postID');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData.id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
            likedByUser: null,
            likes: null
          };
          this.createPostFG.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          })
        });
      }
      else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImgUpload(event) {
    const file = event.target.files[0];
    this.createPostFG.patchValue({ image: file });
    this.createPostFG.get('image').updateValueAndValidity();

    /* now to preview the image */
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.createPostFG.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.createPostFG.value.title, this.createPostFG.value.content, this.createPostFG.value.image).subscribe({
        next: (res) => {
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
    else {
      this.postsService.updatePost(this.postId, this.createPostFG.value.title, this.createPostFG.value.content, this.createPostFG.value.image).subscribe({
        next: (res) => {
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: () => {this.isLoading = false;
          this.router.navigate(['/']);
        }
      });
    }
    this.createPostFG.reset();
  }

  cancelPost() {
    if (this.mode === 'create') {
      this.createPostFG.reset();
      if (this.filePicker) {         /* to reset image input field,  as file types dont get reset just by resetting FG */
        this.filePicker.nativeElement.value = '';
      }
    }
    else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
