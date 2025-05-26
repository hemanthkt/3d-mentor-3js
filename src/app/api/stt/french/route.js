import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function POST(req) {
  try {
    console.log("STT started in backend");

    const body = await req.arrayBuffer();
    const buffer = Buffer.from(body);

    console.log("Audio buffer size:", buffer.length);

    if (buffer.length === 0) {
      return new Response(JSON.stringify({ error: "No audio data received" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(buffer);
    pushStream.close();

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env["SPEECH_KEY"],
      process.env["SPEECH_REGION"]
    );

    const lang = "fr-FR";
    speechConfig.speechRecognitionLanguage = lang;

    // Configure for better recognition
    speechConfig.setProperty(
      sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs,
      "5000"
    );
    speechConfig.setProperty(
      sdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs,
      "500"
    );

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const text = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync((result) => {
        console.log("Recognition result:", result);
        console.log("Recognition status:", result.reason);
        console.log("Result text:", result.text);

        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          console.log("No speech could be recognized");
          resolve(""); // Return empty string instead of error
        } else if (result.reason === sdk.ResultReason.Canceled) {
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.log("Recognition canceled:", cancellation.reason);
          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error(
              "Cancellation error details:",
              cancellation.errorDetails
            );
            reject(
              new Error(`Recognition canceled: ${cancellation.errorDetails}`)
            );
          } else {
            resolve(""); // Return empty for other cancellations
          }
        } else {
          console.error("Speech recognition failed. Reason:", result.reason);
          console.error("Error details:", result.errorDetails);

          // Handle specific error cases
          if (
            result.privJson &&
            result.privJson.includes("InitialSilenceTimeout")
          ) {
            reject(
              new Error(
                "No speech detected - please speak louder or check microphone"
              )
            );
          } else {
            reject(
              new Error(
                result.errorDetails ||
                  `Recognition failed with reason: ${result.reason}`
              )
            );
          }
        }

        recognizer.close();
      });
    });

    return new Response(JSON.stringify({ text }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during speech recognition:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
        details: "Speech recognition failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
