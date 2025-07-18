import { PdokSuggestionInputComponent } from './pdok-suggestion-input.component';
import {createComponentFactory, Spectator} from "@ngneat/spectator";
import {mockProvider} from "@ngneat/spectator/jest";
import {PdokSuggestionService} from "../../pdok-suggestion.service";
import {NotifierService} from "angular-notifier";
import {screen} from "@testing-library/angular";

describe('PdokSuggestionInputComponent', () => {
  let spectator: Spectator<PdokSuggestionInputComponent>;

  const createComponent = createComponentFactory({
    component: PdokSuggestionInputComponent,
    providers: [
      mockProvider(PdokSuggestionService),
      mockProvider(NotifierService),
    ]
  });

  beforeEach(() => {
    jest.useFakeTimers();

    // Force the component to be created with an id and title (should fail if not provided)
    spectator = createComponent({ props: { id: 'start-adres', title: 'Vind een adres' } });
  });

  afterEach(() => {
    jest.useRealTimers();
  })

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should have a default placeholder', () => {
    expect(screen.findByPlaceholderText('Voer hier uw address in')).toExist();
  })

  it('should generate a title when passed to the component', () => {
    expect(screen.findByText('Vind een adres')).toExist();
  });

  it('should generate a id', () => {
    expect(screen.getByLabelText('Vind een adres').getAttribute('id')).toBe('start-adres');
  });

  it('should be able to change the placeholder', () => {
    spectator.setInput('placeholder', 'Vind een adres');
    expect(screen.findByPlaceholderText('Vind een adres')).toExist();
  })

  xit('should initially always clear the suggestions when typing', () => {
    spectator.typeInElement('Test Address', screen.getByLabelText('Vind een adres'));
  });

  it('should not call the service when the user types something before 500 miliseconds', () => {
    const spyOnGetSuggestions = jest.spyOn(spectator.inject(PdokSuggestionService), 'getSuggestionsOnAddress');
    spectator.typeInElement('Test Address', screen.getByLabelText('Vind een adres'));
    expect(spyOnGetSuggestions).not.toHaveBeenCalled();
  })

  xit('should wait 500 miliseconds before calling the service', () => {
    const spyOnGetSuggestions = jest.spyOn(spectator.inject(PdokSuggestionService), 'getSuggestionsOnAddress');
    spectator.typeInElement('Test Address', screen.getByLabelText('Vind een adres'));
    jest.runAllTimers()
    jest.advanceTimersByTime(500);
    spectator.detectComponentChanges();
    expect(spyOnGetSuggestions).toHaveBeenCalled();
  });
});
