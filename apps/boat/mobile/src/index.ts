export {
  crashDamagesTransitions,
  transitions,
} from './lib/navigation/transitions.js';
export { assertBoatA11y } from './lib/a11y.js';
export { createBoatExtension } from './lib/boat-extension.js';
export { BOAT_PT_BR_CATALOG } from './lib/i18n-catalog.js';
export {
  BOAT_ATTESTATION_PORT,
  BOAT_CAMERA_PORT,
  BOAT_ENCRYPTED_STORE_PORT,
  BOAT_GPS_PORT,
  BOAT_PORTS,
  BOAT_SIGNATURE_PORT,
  BOAT_SKETCH_PORT,
  RenaestPort,
} from './lib/ports.js';
export { SketchEditorComponent } from './lib/shared/sketch-editor.component.js';
export {
  ConditionsQuadComponent,
  CrashLinksPanelComponent,
  DamageWitnessFormComponent,
  InvolvedListComponent,
  MinimumDataChecklistComponent,
  PreliminaryReportButtonComponent,
  SceneDutyChecklistComponent,
  SeverityPickerComponent,
  VictimCardComponent,
} from './lib/shared/boat-shared.components.js';
export { victimAccessGuard } from './lib/victim-access.guard.js';
export {
  crashComplementSchema,
  crashConditionsSchema,
  crashDamagesSchema,
  crashDynamicsSchema,
  crashEvidenceSchema,
  crashLocationSchema,
  crashPeopleSchema,
  crashReviewSchema,
  crashSketchSchema,
  crashStartSchema,
  crashVehiclesSchema,
  crashVictimsSchema,
  renaestSchema,
  subjectRequestSchema,
} from './lib/forms/schemas.js';
export { BOAT_GATES } from './lib/forms/gates.js';
export type {
  AttestationPort,
  CameraPort,
  GpsPort,
  MobileEncryptedStorePort,
  SignaturePort,
  SketchPort,
} from './lib/ports.js';
export {
  BOAT_PORT_ERROR_CODES,
  BoatPortError,
  isBoatPortError,
  type BoatHomologationAdapter,
  type BoatPortErrorCode,
  type BoatPortName,
} from './lib/ports/boat-port-error.js';
export { GeolocationGpsAdapter } from './lib/ports/geolocation-gps.adapter.js';
export {
  FileCaptureCameraAdapter,
  type BoatImagePicker,
} from './lib/ports/file-capture-camera.adapter.js';
export {
  CanvasSignatureAdapter,
  type BoatSignatureSurface,
} from './lib/ports/canvas-signature.adapter.js';
export { DrawingJsonSketchAdapter } from './lib/ports/drawing-json-sketch.adapter.js';
export {
  BOAT_ENCRYPTED_STORE_CRYPTO,
  BoatBrowserEncryptedStoreAdapter,
  type BoatSealedRecord,
  type BoatSealedRecordBackend,
} from './lib/ports/browser-encrypted-store.adapter.js';
export { HomologationAttestationAdapter } from './lib/ports/homologation-attestation.adapter.js';
export { provideBoatHomologationPorts } from './lib/ports/homologation-port.providers.js';
