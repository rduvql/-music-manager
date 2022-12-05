import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyAdapterComponent } from './spotify-adapter.component';

describe('SpotifyAdapterComponent', () => {
  let component: SpotifyAdapterComponent;
  let fixture: ComponentFixture<SpotifyAdapterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpotifyAdapterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotifyAdapterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
