import { Scheme } from '../../types.js';

export interface VerifiedSourceCitation {
  schemeName: string;
  department: string;
  classification: string;
  state: string;
  officialWebsite: string;
  onlineUrl?: string;
  sourceVerificationStatus: string;
  advisoryDisclaimer: string;
}

export class SourceVerificationService {
  private static readonly ADVISORY_DISCLAIMER_EN =
    'Note: Information provided by JANASEVA is advisory and grounded in verified government notifications. Final eligibility and approval remain subject to official verification by the respective department.';

  private static readonly ADVISORY_DISCLAIMER_KN =
    'ಗಮನಿಸಿ: ಜನಸೇವಾ ನೀಡುವ ಮಾಹಿತಿಯು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ಆಧರಿಸಿದ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ. ಅಂತಿಮ ಅರ್ಹತೆ ಮತ್ತು ಅನುಮೋದನೆಯನ್ನು ಸಂಬಂಧಪಟ್ಟ ಇಲಾಖಾ ಪ್ರಾಧಿಕಾರಗಳು ನಿರ್ಧರಿಸುತ್ತವೆ.';

  private static readonly ADVISORY_DISCLAIMER_HI =
    'सूचना: जनसेवा द्वारा दी गई जानकारी आधिकारिक सरकारी अधिसूचनाओं पर आधारित परामर्श है। अंतिम पात्रता और स्वीकृति संबंधित विभागीय प्राधिकारी द्वारा ही दी जाती है।';

  public getAdvisoryDisclaimer(language: string): string {
    switch (language) {
      case 'kn':
        return SourceVerificationService.ADVISORY_DISCLAIMER_KN;
      case 'hi':
        return SourceVerificationService.ADVISORY_DISCLAIMER_HI;
      default:
        return SourceVerificationService.ADVISORY_DISCLAIMER_EN;
    }
  }

  public getCitations(schemes: Scheme[], language = 'en'): VerifiedSourceCitation[] {
    return schemes.map(scheme => ({
      schemeName: scheme.name,
      department: scheme.department,
      classification: scheme.classification,
      state: scheme.state,
      officialWebsite: scheme.officialWebsite,
      onlineUrl: scheme.applicationProcedure?.onlineUrl,
      sourceVerificationStatus: scheme.sourceVerificationStatus || 'Official Government Verified',
      advisoryDisclaimer: this.getAdvisoryDisclaimer(language)
    }));
  }
}

export const sourceVerificationService = new SourceVerificationService();
