import express from "express";
import { getService, ServiceContainer, getServiceKalender } from "../clients/index";

export const injectService: express.RequestHandler = async (req, res, next) => {
  const userRole = req.header("x-user-role");

  if (userRole && userRole === "user") {
    let service: ServiceContainer;
    service = getServiceKalender();

    (req as any).service = service;
    next();
  } else {
    let service: ServiceContainer;
    service = getService();

    (req as any).service = service;
    next();
  }
};
