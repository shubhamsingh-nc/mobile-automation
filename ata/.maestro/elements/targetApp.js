// Setting app id based on platform as they are different for DEV env
output.targetAppId =
  maestro.platform === "ios" ? "com.nymcard.masaar" : "com.nymcard.masaar.dev";
