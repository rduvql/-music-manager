import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicAdapterComponent } from './music-adapter.component';

describe('MusicAdapterComponent', () => {
  let component: MusicAdapterComponent;
  let fixture: ComponentFixture<MusicAdapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MusicAdapterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicAdapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
