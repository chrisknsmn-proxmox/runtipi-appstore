import fs from "node:fs/promises";
import path from "node:path";
import type { AppInfo } from "@runtipi/common/schemas";
import * as yaml from "js-yaml";

const packageFile = process.argv[2];
// Optional: take the version from this service instead of the main one, for apps whose main
// service is a proxy in front of the real app (e.g. --service=openpencil-server).
const versionService = process.argv.find((arg) => arg.startsWith("--service="))?.slice("--service=".length);

console.log(`Updating app config for package file: ${packageFile}`);

interface DockerComposeYml {
  services: Record<
    string,
    {
      image: string;
      [key: string]: unknown;
    }
  >;
  [key: string]: unknown;
}



export async function readYamlFile(filepath: string): Promise<any | null> {
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return yaml.load(content);
  } catch (_) {
    return null;
  }
}

export async function readJsonFile<T>(filepath: string): Promise<T> {
  const content = await fs.readFile(filepath, "utf-8");
  return JSON.parse(content);
}

const updateAppConfig = async (packageFile: string) => {
  try {
    const normalizedPackageFile = packageFile.replace(/\\/g, "/");
    const packageFileMatch = normalizedPackageFile.match(/^apps\/[^/]+\/docker-compose\.yml$/);

    if (!packageFileMatch) {
      console.log(`Skipping app config update for non-app compose file: ${packageFile}`);
      return;
    }

    const packageRoot = path.dirname(packageFile);
    const configPath = path.join(packageRoot, "config.json");
    const dockerComposeYmlPath = path.join(packageRoot, "docker-compose.yml");

    const config = await readJsonFile<AppInfo>(configPath);
    const dockerComposeYml = await readYamlFile(dockerComposeYmlPath);

    // Extract main service image version
    let mainServiceVersion: string | null = null;
    
    if (dockerComposeYml && dockerComposeYml.services) {
      for (const [name, service] of Object.entries<any>(dockerComposeYml.services)) {
        if (versionService ? name === versionService : service['x-runtipi'] && service['x-runtipi'].is_main) {
          if (service.image) {
            const versionMatch = service.image.match(/:([^:]+)$/);
            if (versionMatch) {
              mainServiceVersion = versionMatch[1];
            }
          }
          break;
        }
      }
    }

    if (!mainServiceVersion) {
      console.warn(`Could not find the ${versionService ? `"${versionService}"` : "main"} service's image tag in docker-compose.yml`);
    } else {
      config.version = mainServiceVersion;
    }

    config.tipi_version = config.tipi_version + 1;
    config.updated_at = Date.now();

    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    
    console.log(`✓ Updated config.json: version=${mainServiceVersion || 'unchanged'}, tipi_version=${config.tipi_version}`);
  } catch (e) {
    console.error(`Failed to update app config, error: ${e}`);
  }
};

if (!packageFile) {
  console.error("Usage: bun update-config.ts <packageFile> [--service=<name>]");
  process.exit(0);
}
updateAppConfig(packageFile);
