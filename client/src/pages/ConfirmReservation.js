import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';


export default function Contact() {
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();

    
    const translations = {
        EN: {
            confirm: "Thank you for choosing us. We've sent you a confirmation email, please check your mailbox to finish the reservation process.",
        },
        PL: {
            confirm: 'Dziękujemy za wybranie naszych usług. Wysłaliśmy Ci maila z potwierdzeniem, prosimy sprawdzić swoją skrzynkę pocztową, by ukończyć proces umawiania wizyty.',
        }
    };

    return (
        <>
            <h2>{translations[language].confirm}</h2>
        </>
    )
}