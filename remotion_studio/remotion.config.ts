import { Config } from "@remotion/cli/config";
import path from "path";

Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("angle");
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
Config.setBrowserExecutable(null);
Config.setChromiumMultiProcessOnLinux(true);
Config.setDelayRenderTimeoutInMilliseconds(90000);

Config.overrideWebpackConfig((currentConfiguration) => {
  const rootDir = process.cwd();
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...(currentConfiguration.resolve?.alias ?? {}),
        "@shared": path.resolve(rootDir, "src/shared"),
        "@projects": path.resolve(rootDir, "src/projects"),
      },
    },
  };
});
