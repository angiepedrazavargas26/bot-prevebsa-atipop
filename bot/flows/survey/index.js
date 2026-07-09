// bot/flows/survey/index.js
// Punto de entrada de la funcionalidad de encuesta con WhatsApp Flows.

const surveyConfig = require("./questions");
const { buildSurveyFlow } = require("./flowBuilder");
const {
  sendSurvey,
  parseSurveyResponse,
  formatSurveyAnswers,
  notifySurveyResult,
  sendThankYou,
  publishSurveyFlow,
} = require("./surveyService");

module.exports = {
  surveyConfig,
  buildSurveyFlow,
  sendSurvey,
  parseSurveyResponse,
  formatSurveyAnswers,
  notifySurveyResult,
  sendThankYou,
  publishSurveyFlow,
};
