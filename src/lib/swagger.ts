export const spec = {
  openapi: "3.0.0",
  info: {
    title: "Freelance SaaS API",
    version: "1.0.0",
    description:
      "Documentation de l'API pour la gestion des clients et factures",
  },
  paths: {
    "/api/clients": {
      get: {
        summary: "Récupérer tous les clients",
        responses: {
          "200": {
            description: "Liste des clients récupérée avec succès",
          },
        },
      },
      post: {
        summary: "Ajouter un nouveau client",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  status: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Client créé" },
        },
      },
    },
  },
};
