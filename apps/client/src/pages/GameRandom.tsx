import {  useEffect } from "react";
import { useUser } from "../hooks/useUser";
import { useParams } from "react-router-dom";
import GameLobby from "../components/Ui/GameLoby";


export default function GameRandom(){
  const user = useUser();
  const { gameId } = useParams();

  useEffect(() => {
    console.log('user is ', user)

    if (!user) {
    //   window.location.href = '/login';
    }
  }, [user]);

  if(!gameId){
    return <div className="bg-white h-full w-100%">
        <GameLobby
          user={user}
          onGameCreated={(newGameId:string) => {
            window.location.href = `game/random/${newGameId}`;
          }}
        />
    </div>
  }

  return <div className="bg-white h-full w-100%">
    Hey Buddy
  </div>
}