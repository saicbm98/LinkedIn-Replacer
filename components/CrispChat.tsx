import { useEffect } from 'react';

export const CrispChat = () => {
  useEffect(() => {
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "06f6a048-e989-4f76-bdfd-49893a41f589";
    
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    
    script.onload = () => {
      // Hide Crisp's default widget completely
      window.$crisp.push(['do', 'chat:hide']);
      
      console.log('✅ Crisp loaded in background');
    };
    
    document.getElementsByTagName("head")[0].appendChild(script);
  }, []);

  return null;
};

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}