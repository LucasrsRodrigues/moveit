import { createContext, useState, ReactNode, useEffect } from 'react';
import challenges from '../../challenges.json';
import Cookies from 'js-cookie';
import { LevelUpModal } from '../components/LevelUpModal';

interface ChallengesProviderProps{
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number;
}

interface Challenge {
    type:'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengeContextData {
    level: number;
    currentExperience: number; 
    challengesCompleted: number;
    experienceToNextLevel:number;
    activeChallenge: Challenge;
    resetChallenge: () => void;
    levelUp: () => void;
    startNewChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;

}

export const ChallengeContext = createContext({} as ChallengeContextData);

export function ChallengesProvider({ 
    children, 
    ...rest
} :ChallengesProviderProps){
    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengesCompleted, setChalengesCompleted] = useState(rest.challengesCompleted ?? 0);
    
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));

    }, [level, currentExperience, challengesCompleted]);

    function levelUp(){
        setLevel(level + 1);
        setIsLevelUpModalOpen(true);
    }

    function startNewChallenge(){
       const randomChallengeIndex = Math.floor(Math.random() *challenges.length);
       const challenge = challenges[randomChallengeIndex];

       setActiveChallenge(challenge);

       new Audio('/notification.mp3').play();

       if(Notification.permission === 'granted'){
           new Notification('Novo desafio 🎉', {
               body: `Valendo ${challenge.amount}xp!`
           });
       }
    }

    function resetChallenge(){  
        setActiveChallenge(null);
    }

    function completeChallenge(){
        if(!activeChallenge){
            return;
        }
        const { amount } = activeChallenge;
        
        let finalExperience = currentExperience + amount;

        if(finalExperience >= experienceToNextLevel){
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }
        console.log(finalExperience);
        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChalengesCompleted(challengesCompleted + 1);
    }

    function closeLevelUpModal(){
        setIsLevelUpModalOpen(false);
    }


    return(
        <ChallengeContext.Provider value={{
            level, 
            levelUp,
            currentExperience, 
            challengesCompleted,
            startNewChallenge,
            activeChallenge,
            resetChallenge,
            experienceToNextLevel,
            completeChallenge,
            closeLevelUpModal
        }}>
            {children}

            {isLevelUpModalOpen && <LevelUpModal />}
        </ChallengeContext.Provider>
    );
}