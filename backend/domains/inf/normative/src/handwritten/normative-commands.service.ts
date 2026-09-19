// CTG-0003 §6 (M13, R-0008, TASK-0007) — fachada dos comandos e consultas
// manuscritos do catálogo e do pacote normativo usada por
// `normative-commands.controller.ts`.
import {
  GeneratePackageCommand,
  type GeneratePackageInput,
  type GeneratePackageResult,
} from './generate-package.command.js';
import type { NormativeDeps } from './normative-runtime.js';
import {
  PackageContentQuery,
  type PackageContentResult,
} from './package-content.query.js';
import {
  PackageSyncMetadataQuery,
  type SyncMetadataPackage,
} from './package-sync-metadata.query.js';
import {
  PublishCatalogCommand,
  type CatalogCommandResult,
  type PublishCatalogInput,
  type RetireCatalogInput,
} from './publish-catalog.command.js';
import {
  PublishPackageCommand,
  type PackageCommandResult,
  type PublishPackageInput,
  type RetirePackageInput,
} from './publish-package.command.js';
import {
  ValidatePackageCommand,
  type ValidatePackageInput,
  type ValidatePackageResult,
} from './validate-package.command.js';

export class NormativeCommandsService {
  private readonly catalogs: PublishCatalogCommand;
  private readonly generatePackage: GeneratePackageCommand;
  private readonly packages: PublishPackageCommand;
  private readonly validation: ValidatePackageCommand;
  private readonly content: PackageContentQuery;
  private readonly syncMetadata: PackageSyncMetadataQuery;

  constructor(deps: NormativeDeps) {
    this.catalogs = new PublishCatalogCommand(deps);
    this.generatePackage = new GeneratePackageCommand(deps);
    this.packages = new PublishPackageCommand(deps);
    this.validation = new ValidatePackageCommand(deps);
    this.content = new PackageContentQuery(deps);
    this.syncMetadata = new PackageSyncMetadataQuery(deps);
  }

  publishCatalog(
    id: string,
    input: PublishCatalogInput,
  ): Promise<CatalogCommandResult> {
    return this.catalogs.publish(id, input);
  }

  retireCatalog(
    id: string,
    input: RetireCatalogInput,
  ): Promise<CatalogCommandResult> {
    return this.catalogs.retire(id, input);
  }

  generate(input: GeneratePackageInput): Promise<GeneratePackageResult> {
    return this.generatePackage.execute(input);
  }

  publishPackage(
    id: string,
    input: PublishPackageInput,
  ): Promise<PackageCommandResult> {
    return this.packages.publish(id, input);
  }

  retirePackage(
    id: string,
    input: RetirePackageInput,
  ): Promise<PackageCommandResult> {
    return this.packages.retire(id, input);
  }

  validatePackage(
    id: string,
    input: ValidatePackageInput,
  ): Promise<ValidatePackageResult> {
    return this.validation.execute(id, input);
  }

  packageContent(id: string): Promise<PackageContentResult> {
    return this.content.execute(id);
  }

  packageSyncMetadata(): Promise<{ packages: SyncMetadataPackage[] }> {
    return this.syncMetadata.execute();
  }
}
