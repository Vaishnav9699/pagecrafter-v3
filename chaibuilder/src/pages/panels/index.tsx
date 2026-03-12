import { registerChaiSidebarPanel } from "@chaibuilder/runtime/client";
import { aiPanel, aiPanelId } from "./ai-panel/ai-panel";
import { langPanel, langPanelId } from "./lang-panel";
import { seoPanel, seoPanelId } from "./seo-panel";
import { userInfoPanel, userInfoPanelId } from "./user-info";

export const registerChaiPanels = () => {
  registerChaiSidebarPanel(seoPanelId, seoPanel);
  registerChaiSidebarPanel(langPanelId, langPanel);
  registerChaiSidebarPanel(userInfoPanelId, userInfoPanel);
  registerChaiSidebarPanel(aiPanelId, aiPanel);
};
