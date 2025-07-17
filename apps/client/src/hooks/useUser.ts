import { useRecoilValue } from "recoil";
import { userAtom } from "@repo/store/userAtom";

export const useUser = () => {
  const value = useRecoilValue(userAtom)
  return value
}