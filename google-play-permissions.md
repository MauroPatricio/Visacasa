# Google Play Permission Declarations - Visacasa Apps

This document provides the required privacy policy declarations for location permissions used in Visacasa applications.

## Apps Requiring Location Permissions

- **Visacasa (Customer App)**: Uses location to show nearby stores and products
- **Visacasa Driver**: Uses location for real-time delivery tracking

---

## Permission: ACCESS_FINE_LOCATION

### Permission Name
Fine Location (ACCESS_FINE_LOCATION)

### Usage Description for Google Play Console

**English:**
```
The Visacasa app uses precise location to:
1. Show nearby stores and products based on your current location
2. Calculate accurate delivery distances and costs
3. Display your location on the map when requesting deliveries
4. Enable turn-by-turn navigation for delivery drivers

This permission is only used when the app is open and only after explicit user consent. Location data is not shared with third parties except for essential delivery service providers. Users can disable location access at any time through device settings.
```

**Portuguese:**
```
O aplicativo Visacasa usa localização precisa para:
1. Mostrar lojas e produtos próximos com base na sua localização atual
2. Calcular distâncias de entrega precisas e custos
3. Exibir sua localização no mapa ao solicitar entregas
4. Ativar navegação passo a passo para motoristas de entrega

Esta permissão é usada apenas quando o aplicativo está aberto e somente após consentimento explícito do usuário. Os dados de localização não são compartilhados com terceiros, exceto provedores essenciais de serviço de entrega. Os usuários podem desativar o acesso à localização a qualquer momento através das configurações do dispositivo.
```

### Justification
- **Core Functionality**: Location is required for the primary function of showing nearby stores and calculating delivery routes
- **User-Initiated**: Location access is only requested when user interacts with map features
- **Transparency**: Users are clearly informed why location is needed

---

## Permission: ACCESS_COARSE_LOCATION

### Permission Name
Approximate Location (ACCESS_COARSE_LOCATION)

### Usage Description for Google Play Console

**English:**
```
Visacasa uses approximate location as a fallback when precise location is unavailable. This helps:
1. Show general area stores and products
2. Provide estimated delivery costs
3. Improve user experience when GPS is weak

Approximate location provides city-level accuracy and is only used with explicit user consent. This data is not sold or shared with advertisers.
```

**Portuguese:**
```
O Visacasa usa localização aproximada como alternativa quando a localização precisa não está disponível. Isso ajuda a:
1. Mostrar lojas e produtos da área geral
2. Fornecer custos estimados de entrega
3. Melhorar a experiência do usuário quando o GPS está fraco

A localização aproximada fornece precisão ao nível da cidade e é usada apenas com consentimento explícito do usuário. Esses dados não são vendidos nem compartilhados com anunciantes.
```

### Justification
- **Fallback Option**: Provides service when precise location is unavailable
- **Privacy-Friendly**: Less precise than fine location
- **User Control**: Can be disabled by users

---

## Permission: ACCESS_BACKGROUND_LOCATION (Driver App Only)

### Permission Name
Background Location (ACCESS_BACKGROUND_LOCATION)

### Usage Description for Google Play Console

**English:**
```
The Visacasa Driver app requires background location access to:
1. Track active delivery progress in real-time
2. Update customer with driver's location during delivery
3. Calculate accurate arrival times
4. Ensure delivery completion tracking

Background location is ONLY active during active deliveries and automatically stops when delivery is completed. Drivers must explicitly enable this permission and can disable it at any time. Location data is used solely for delivery tracking and is not shared with third parties except the customer receiving the delivery.
```

**Portuguese:**
```
O aplicativo Visacasa Driver requer acesso à localização em segundo plano para:
1. Rastrear o progresso de entrega ativa em tempo real
2. Atualizar o cliente com a localização do motorista durante a entrega
3. Calcular tempos precisos de chegada
4. Garantir o rastreamento de conclusão da entrega

A localização em segundo plano está ATIVA somente durante entregas ativas e para automaticamente quando a entrega é concluída. Os motoristas devem habilitar explicitamente esta permissão e podem desativá-la a qualquer momento. Os dados de localização são usados exclusivamente para rastreamento de entrega e não são compartilhados com terceiros, exceto o cliente que recebe a entrega.
```

### Justification
- **Essential Service**: Required for real-time delivery tracking
- **Limited Scope**: Only active during deliveries
- **Transparent**: Drivers are informed and must explicitly consent

---

## Privacy Policy Requirements

Your app's privacy policy must clearly state:

1. **What data is collected**: GPS location data (fine and coarse)
2. **Why it's collected**: Show nearby stores, calculate delivery costs, track deliveries
3. **When it's collected**: Only when app is in use (or during active deliveries for drivers)
4. **How it's used**: Improve user experience, enable core functionality
5. **Who it's shared with**: Not shared except with delivery service providers
6. **User control**: Users can disable location permissions anytime
7. **Data retention**: Location data is not stored permanently

### Privacy Policy URL
You must provide a publicly accessible privacy policy URL in Google Play Console:
```
https://visacasa.example.com/privacy-policy
```

---

## App Store Connect (iOS) Declaration

For iOS apps, add these strings to `app.json` or `Info.plist`:

### NSLocationWhenInUseUsageDescription
```
A Visacasa precisa da sua localização para mostrar produtos e lojas próximas de você.
```

### NSLocationAlwaysUsageDescription (Driver App Only)
```
A Visacasa Driver precisa da sua localização em segundo plano para rastrear entregas em tempo real e manter os clientes atualizados.
```

---

## Testing Location Permissions

### Before Submission
1. Install app on test device
2. Deny location permission initially
3. Verify app handles denial gracefully
4. Grant permission and verify features work
5. Revoke permission and verify app continues to function (with limited features)

### Required Behavior
- App must NOT crash when location is denied
- App must clearly explain why location is needed
- App must provide alternative functionality when location is unavailable
- App must NOT repeatedly prompt for location if user denies

---

## Compliance Checklist

- [ ] Privacy policy is updated and publicly accessible
- [ ] Location permission rationale is shown to users before request
- [ ] App functions (with limitations) when location is denied
- [ ] Location data is not used for advertising or sold to third parties
- [ ] Background location (driver app) only runs during active deliveries
- [ ] Users can disable location permissions without app crashing
- [ ] Google Play Console permission declarations are complete
- [ ] App Store Connect privacy declarations are complete
