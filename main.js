import IpscapeWebClient from "@ipscape/web-client";
import { namespaceExists } from "./lib.js";

(function () {
  const webClient = new IpscapeWebClient();
  const integration = "ipscape-qa-test";
  const version = "1.0.0";

  if (!namespaceExists("window.ipscape")) {
    throw new Error("Unable to connect to Ipscape");
  }

  function invokeParentPostMessage(name, args) {
    const params = {
      methodName: name,
      clientVersion: webClient.version,
      response: args,
    };

    const payload = JSON.parse(JSON.stringify(params));
    if (window && window.top) window.top.postMessage(payload, "*");
  }

  // Get instance custom configuration
  webClient.getIntegrationSettings("QA").then((response) => {
    const integrationSettings = response.result.config;
    invokeParentPostMessage("getIntegrationSettings", integrationSettings);
  });

  // Set listener for agent login
  webClient.onAgentLogin((eventData) => {
    if (eventData.error)
      throw Error(`AGENT:LOGIN: ${JSON.stringify(eventData.error)}`);
    invokeParentPostMessage("agentLogin", eventData);
  });

  // Set listener for agent logout
  webClient.onAgentLogout((eventData) => {
    if (eventData.error)
      throw Error(`AGENT:LOGOUT: ${JSON.stringify(eventData.error)}`);
    invokeParentPostMessage("agentLogout", eventData);
  });

  // Set listener for agent presence
  webClient.onAgentPresenceChange((eventData) => {
    invokeParentPostMessage("agentPresenceChange", eventData);
  });

  // Call failed
  webClient.onCallFailed((eventData) => {
    invokeParentPostMessage("callFailed", eventData);
  });

  // Call start
  webClient.onCallStarted((eventData) => {
    invokeParentPostMessage("callStarted", eventData);
  });

  // Call disconnected (hangup)
  webClient.onCallHangup((eventData) => {
    invokeParentPostMessage("callHangup", eventData);
  });

  // Call wrap
  webClient.onCallWrapped((eventData) => {
    invokeParentPostMessage("callWrapped", eventData);
  });

  // Preview Allocated
  webClient.onPreviewAllocated((eventData) => {
    invokeParentPostMessage("previewAllocated", eventData);
  });

  // In call component update
  webClient.onComponentChanged((eventData) => {
    invokeParentPostMessage("componentChanged", eventData);
  });

  // Interaction Open
  webClient.onInteractionOpen((eventData) => {
    invokeParentPostMessage("interactionOpen", eventData);
  });

  // Interaction Closed
  webClient.onInteractionClosed((eventData) => {
    invokeParentPostMessage("interactionClosed", eventData);
  });

  // Listen for events from the UI
  window.addEventListener(
    "message",
    (event) => {
      // if (event.origin !== scriptOrigin) return;
      const { payload } = event.data;
      switch (event.data.event) {
        case "clickToDial":
          webClient.clickToDial(event.data).then((eventData) => {
            invokeParentPostMessage("clickToDial", eventData);
          });
          break;
        case "isAuthorised":
          webClient.isAuthorised().then((eventData) => {
            invokeParentPostMessage("isAuthorised", eventData);
          });
          break;
        case "getAgentDetails":
          webClient.getAgentDetails().then((data) => {
            invokeParentPostMessage("getAgentDetails", data);
          });
          break;
        case "getAgentPresence":
          webClient.getAgentPresence().then((data) => {
            invokeParentPostMessage("getAgentPresence", data);
          });
          break;
        case "getAgentCampaigns":
          webClient.getAgentCampaigns().then((data) => {
            invokeParentPostMessage("getAllocatedCampaigns", data);
          });
          break;
        case "getPauseReasons":
          webClient.getPauseReasons().then((data) => {
            invokeParentPostMessage("getPauseReasons", data);
          });
          break;
        case "getCurrentInteraction":
          webClient.getCurrentInteraction().then((data) => {
            invokeParentPostMessage("getCurrentInteraction", data);
          });
          break;
        case "getInteractionById":
          webClient.getInteractionById(JSON.parse(payload)).then((data) => {
            invokeParentPostMessage("getInteractionById", data);
          });
          break;
        case "getIntegrationSettings":
          webClient.getIntegrationSettings(payload).then((data) => {
            invokeParentPostMessage("getIntegrationSettings", data);
          });
          break;
        case "inCallComponentOptionAdd":
          webClient.addComponentOption(JSON.parse(payload)).then((data) => {
            invokeParentPostMessage("addComponentOption", data);
          });
          break;
        default:
          console.warn(
            `QA Integration: unidentified event (${JSON.stringify(event.data)})`
          );
      }
    },
    false
  );

  console.log(`
    ===========================================
      WebClientVersion: ${webClient.version}
      Integration: ${integration}
      IntegrationVersion: ${version}
    ===========================================`);
})();
