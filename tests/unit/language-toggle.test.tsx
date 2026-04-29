import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/i18n';
import { LanguageToggle } from '../../src/components/ui/language-toggle';

// Mock i18n for testing
const mockI18n = {
  language: 'en',
  changeLanguage: jest.fn(),
};

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n.language = 'en';
  });

  test('renders language toggle button', () => {
    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('EN | FR');
  });

  test('calls changeLanguage when clicked', async () => {
    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr');
    });
  });

  test('switches from English to French', async () => {
    mockI18n.language = 'en';
    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr');
    });
  });

  test('switches from French to English', async () => {
    mockI18n.language = 'fr';
    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('en');
    });
  });

  test('has proper accessibility attributes', () => {
    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    
    const ariaLabel = button.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/Switch/);
  });

  test('updates document language attribute', async () => {
    // Mock document.documentElement
    const mockDocumentElement = {
      lang: 'en',
    };
    Object.defineProperty(document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    });

    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockDocumentElement.lang).toBe('fr');
    });
  });

  test('updates document title', async () => {
    // Mock document.title
    Object.defineProperty(document, 'title', {
      value: 'Gaia Capital Dashboard',
      writable: true,
    });

    renderWithI18n(<LanguageToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(document.title).toBe('Tableau de Bord Gaia Capital');
    });
  });
});
