# APK Android CAPO Studio

Application Android légère (Capacitor) qui ouvre le **site CAPO en production** dans une WebView native. Vous testez donc avec les **vraies données en ligne** : comptes, cours, uploads, etc.

## URL connectée

```
http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io
```

Pour changer l’URL (ex. domaine perso), définissez `CAPO_APP_URL` avant le build :

```powershell
$env:CAPO_APP_URL = "https://votre-domaine.fr"
cd mobile
npm install
npx cap sync android
```

## Télécharger l’APK (recommandé)

1. Allez sur GitHub → **Actions** → workflow **Build Android APK**
2. Cliquez **Run workflow** (ou attendez le build auto après push)
3. Une fois terminé, ouvrez l’exécution → section **Artifacts** → téléchargez `capo-studio-debug-apk`
4. Transférez `app-debug.apk` sur votre téléphone et installez-le  
   (autorisez « sources inconnues » si Android le demande)

## Build local (Windows + Android Studio)

Prérequis : [Android Studio](https://developer.android.com/studio) avec SDK Android 34+.

```powershell
cd mobile
npm install
npx cap add android
node scripts/prepare.mjs
npx cap sync android
npx cap open android
```

Dans Android Studio : **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Ou en ligne de commande :

```powershell
cd mobile\android
.\gradlew.bat assembleDebug
```

APK généré : `mobile\android\app\build\outputs\apk\debug\app-debug.apk`

## Notes

- APK **debug** : pour tests uniquement, pas pour le Play Store.
- Connexion **HTTP** autorisée (serveur prod actuel sans HTTPS).
- Les cookies de session fonctionnent comme sur le navigateur mobile.
- Pour la prod Play Store : certificat de signature release + HTTPS recommandé.
