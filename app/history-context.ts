import React, { useContext } from "react";

export const HistoryContext = React.createContext(null);

export const useHistory = () => {
  const { history } = useContext(HistoryContext);
  return history;
};
