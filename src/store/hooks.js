import { useDispatch, useSelector } from 'react-redux'

// Standard custom hooks for dispatching actions and reading Redux store state
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

export { useDispatch, useSelector }
