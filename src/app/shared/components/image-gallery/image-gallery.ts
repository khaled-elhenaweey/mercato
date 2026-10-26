import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-image-gallery',
  imports: [CommonModule],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
})
export class ImageGallery {
  images = input.required<string[]>();
  selectedIndex = signal<number>(0);
}
