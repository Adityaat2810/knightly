import { useNavigate } from "react-router-dom"

export default function Landing(){
  const naviagte = useNavigate();

  return(
    <div className="flex justify-center">
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex justify-center">
                <img
                    src={'/chessboard.jpeg'}
                    className="max-w-96"
                />
                </div>

                <div className="pt-15">
                <div className="flex justify-center">
                    <h3 className="text-4xl font-bold text-white">
                    Play chess online on #2 Site!
                    </h3>
                </div>

                <div className="mt-4 flex justify-center">
                    <button
                      className="p-8 bg-blue-500 hover:bg-blue-700
                    text-white font-bold py-2 px-4 rounded"
                      onClick={()=>{
                        naviagte('/game')
                      }}
                    >
                        Play Online
                    </button>
                </div>
                </div>
            </div>

        </div>
    </div>

  )
}