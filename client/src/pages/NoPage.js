import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export default function NoPage() {
    const { language } = useContext(LanguageContext);

    const translations = {
        EN: {
          notfound: 'Page not found'
        },
        PL: {
            notfound: 'Nie znaleziono strony'
        }
      };

    return (
        <>
            <h2>{translations[language].notfound}</h2>
        </>
    )
}