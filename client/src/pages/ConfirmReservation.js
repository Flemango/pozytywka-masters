import React, { useContext, useEffect } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Confirmation() {
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const location = useLocation();
    const reservationDetails = location.state?.reservationDetails;

    const translations = {
        EN: {
            confirm: "Thank you for choosing our services.\nWe've sent you a confirmation email, please check your mailbox to finish the reservation process.",
            backToHome: "Back to Home",
        },
        PL: {
            confirm: 'Dziękujemy za wybranie naszych usług.\nWysłaliśmy Ci maila z potwierdzeniem, prosimy sprawdzić swoją skrzynkę pocztową, by ukończyć proces umawiania wizyty.',
            backToHome: "Powrót do strony głównej",
        }
    };

    useEffect(() => {
        if (reservationDetails) {
            sendConfirmationEmail(reservationDetails);
        }
    }, [reservationDetails]);

    const sendConfirmationEmail = async (details) => {
        try {
            await axios.post('http://localhost:5000/send-confirmation-email', details);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const renderWithLineBreaks = (text) => {
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className="confirmation-page">
            <h2>{renderWithLineBreaks(translations[language].confirm)}</h2>
            <button className="home-button" onClick={handleBackToHome}>{translations[language].backToHome}</button>
        </div>
    );
}