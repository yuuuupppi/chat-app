import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Chat App API",
    version: "1.0.0",
    description: "API для чат-приложения",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Регистрация пользователя",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Успешная регистрация" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Вход пользователя",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Успешный вход" },
        },
      },
    },
  },
};

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
