import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import './Services.css'

export default function Services() {
    const { language } = useContext(LanguageContext);

    const translations = {
        EN: {
            title: 'Our Services',
            individualTherapy: {
                title: 'Individual Therapy',
                description: 'One-on-one sessions tailored to your specific needs and concerns.'
            },
            couplesCounseling: {
                title: 'Couples Counseling',
                description: 'Improve communication and resolve conflicts in your relationship.'
            },
            familyTherapy: {
                title: 'Family Therapy',
                description: 'Address family dynamics and strengthen relationships within the family unit.'
            },
            groupTherapy: {
                title: 'Group Therapy',
                description: 'Gain support and insights from others facing similar challenges.'
            }
        },
        PL: {
            title: 'Nasze Usługi',
            individualTherapy: {
                title: 'Terapia Indywidualna',
                description: 'Sesje jeden na jeden dostosowane do Twoich konkretnych potrzeb i problemów.'
            },
            couplesCounseling: {
                title: 'Terapia dla Par',
                description: 'Poprawa komunikacji i rozwiązywanie konfliktów w związku.'
            },
            familyTherapy: {
                title: 'Terapia Rodzinna',
                description: 'Zajmowanie się dynamiką rodziny i wzmacnianie relacji w jednostce rodzinnej.'
            },
            groupTherapy: {
                title: 'Terapia Grupowa',
                description: 'Uzyskaj wsparcie i spostrzeżenia od innych osób stojących przed podobnymi wyzwaniami.'
            }
        }
    };

    const { title, ...services } = translations[language];

    return (
        <div className="services-container">
            <h2>{title}</h2>
            <div className="services-grid">
                {Object.entries(services).map(([key, service]) => (
                    <div key={key} className="service-item">
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}