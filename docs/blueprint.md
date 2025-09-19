# **App Name**: Gemini Studio

## Core Features:

- Modelvalg: Tillad brugere at vælge fra en dropdown-menu af tilgængelige Gemini-modeller (Pro, Flash, Flash-Lite, Image).
- Tekstinput: Tilbyd et tekstinputfelt, hvor brugerne kan indtaste deres prompter.
- Billedeupload (Betinget): Aktiver billed-upload kun når en billedmodel er valgt. Appen skal bruge tool til at undgå at bruge billed-upload i LLM-flowet, i tilfælde af at en ikke-billedmodel er valgt.
- AI-svarvisning: Vis det AI-genererede tekstsvar i et tydeligt chatbobleformat.
- Billedpreview og download: Når du bruger en billedmodel, skal du vise det genererede billede med en downloadmulighed.
- Prompt-indsendelse til Gemini: Sender brugerens prompt og medier (hvis relevant) til Gemini AI API'et og modtager/behandler svaret.

## Style Guidelines:

- Primær farve: En afdæmpet blå (#6699CC) for at afspejle klarheden og fokus i Googles design, samtidig med at man undgår direkte efterligning.
- Baggrundsfarve: Lysegrå (#F0F0F0), der tilbyder en ren, neutral baggrund for indhold.
- Accentfarve: En blid grøn (#90EE90), omhyggeligt udvalgt for visuel kontrast og for at henlede opmærksomheden på interaktive elementer.
- Body og headline font: 'Inter' sans-serif, for at sikre en moderne, maskinel, objektiv og neutral læseoplevelse.
- Enkle, geometriske ikoner til navigation og handlinger.
- Kortbaseret layout med bløde skygger og afrundede hjørner (rounded-2xl).
- Subtile fade-in animationer ved hjælp af Framer Motion til AI-svar.