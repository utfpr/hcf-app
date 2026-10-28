This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## APK de release com a API de desenvolvimento da UTFPR

A API de dev fica em `https://api.dev.hcf.cm.utfpr.edu.br` (HTTPS, então funciona em qualquer rede, sem mexer no `network_security_config.xml`).

1. Crie um `.env.dev` (fica fora do git) com `API_BASE_URL=https://api.dev.hcf.cm.utfpr.edu.br` (sem `/api`: o servidor já prefixa).
2. Gere o APK com esse arquivo:

   ```sh
   rm -rf /tmp/metro-*
   cd android
   ENVFILE=.env.dev ./gradlew :app:createBundleReleaseJsAndAssets --rerun assembleRelease -PreactNativeArchitectures=arm64-v8a
   ```

   O `--rerun` é necessário porque o Gradle não vê a troca de `ENVFILE` e, sem ele, reaproveita o bundle JS do build anterior (com a URL antiga).

## APK de release com o back no PC (cabo USB)

O APK de release só aceita HTTP sem TLS para `localhost`, `127.0.0.1` e `10.0.2.2` (ver `android/app/src/release/res/xml/network_security_config.xml`); qualquer outro endereço precisa de HTTPS.

1. No `.env` do app: `API_BASE_URL=http://localhost:3010/api`
2. Gere o APK (a URL fica fixa dentro dele):

   ```sh
   cd android
   ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
   ```

   O APK sai em `android/app/build/outputs/apk/release/app-release.apk`. Sem o `-PreactNativeArchitectures` ele compila para 4 arquiteturas e demora bem mais (e ocupa vários GB).
3. Suba o `hcf-api` no PC na porta `3010`.
4. Com o celular no cabo e a depuração USB ligada:

   ```sh
   adb reverse tcp:3010 tcp:3010
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

   O `adb reverse` precisa ser refeito sempre que o cabo for desconectado.

## APK de release com o back no PC (hotspot, sem cabo)

Para distribuir o APK a quem não vai ligar o celular no PC: o PC cria um hotspot Wi-Fi e fica sempre em `10.42.0.1`, que também está liberado para HTTP no `network_security_config.xml`.

1. Crie um `.env.release` (fica fora do git) com `API_BASE_URL=http://10.42.0.1:3010/api`.
2. Gere o APK com esse arquivo:

   ```sh
   cd android
   ENVFILE=.env.release ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
   ```

   Se o endereço mudou desde o último build, apague antes o cache do Metro (`/tmp/metro-*`): o `react-native-dotenv` grava a URL na transformação e o cache mantém a antiga.
3. No PC, com o cabo de rede conectado (a internet dos celulares sai por ele), suba o `hcf-api` e crie o hotspot:

   ```sh
   nmcli device wifi hotspot ifname wlo1 ssid hcf-dev password '<senha com 8+ caracteres>'
   ```

4. Com o `ufw` ativo, libere a entrada e o repasse do hotspot (sem isso o celular fica sem internet, o Android manda o tráfego pelos dados móveis e o app não alcança o back):

   ```sh
   sudo ufw allow in on wlo1
   sudo ufw route allow in on wlo1 out on enp4s0
   ```

5. Nos celulares: conecte ao Wi-Fi `hcf-dev` e instale o APK.

Outro endereço exige mudar o `API_BASE_URL` e incluir o IP no `network_security_config.xml`.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
