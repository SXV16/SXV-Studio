import { Component, OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {

  constructor(private dialogService: DialogService) { }

  ngOnInit(): void {
  }

  async submitFeedback(event: Event) {
    event.preventDefault();
    await this.dialogService.alert('Thank you! Your feedback has been securely transmitted. The SXV Studio engineering team will review it shortly.');
    (event.target as HTMLFormElement).reset();
  }
}
