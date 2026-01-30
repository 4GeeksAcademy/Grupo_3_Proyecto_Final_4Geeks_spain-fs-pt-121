import React from "react";
import { Home } from "./Home";
import { LandingPublic } from "./LandingPublic";

export const HomeGate = () => {
  const token = localStorage.getItem("token");
  return token ? <Home /> : <LandingPublic />;
};