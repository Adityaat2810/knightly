import { useEffect } from "react";
import { useUser } from "../hooks/useUser";


export default function GameRandom(){
  const user = useUser();
  useEffect(() => {
    console.log('user is ', user)
    if (!user) {
    //   window.location.href = '/login';
    }
  }, [user]);
  return <div className="bg-white h-full w-100%">
    Hey Buddy
  </div>
}