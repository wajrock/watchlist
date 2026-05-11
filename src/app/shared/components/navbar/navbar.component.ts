import {CommonModule} from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

export type NavBarOptions = 'watchlist' | 'search' | 'history' | 'profile';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  user: number = JSON.parse(localStorage.getItem("user")!);
  @ViewChild('active') active!: ElementRef;
  @Output() onIndexSelected = new EventEmitter<NavBarOptions>();

  constructor(private router: Router){}

  ngOnInit(): void {
    this.swichPositionHover('watchlist'); 
  }

  swichPositionHover(option: NavBarOptions) {
    let position: number;

    switch (option) {
      case 'watchlist':
        position = 0;
        this.router.navigateByUrl('/', {replaceUrl: true});
        break;
      case 'search':
        position = 1;
        this.router.navigateByUrl('/search', {replaceUrl: true});
        break;
      case 'profile':
        position = 2;
        this.router.navigateByUrl('/profile', {replaceUrl: true});
        break;
      case 'history':
        position = 2;
        break;
      default:
        position = 0;
        break;
    }
    // this.onIndexSelected.emit(option);

    if (this.active) {
      this.active.nativeElement.style.transform = `translateX(${position * 100}%)`;
    }
  }
}
