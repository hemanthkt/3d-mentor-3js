import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { PassThrough } from "stream";

export async function GET(req) {
  // WARNING: Do not expose your keys
  // WARNING: If you host publicly your project, add an authentication layer to limit the consumption of Azure resources

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env["SPEECH_KEY"],
    process.env["SPEECH_REGION"]
  );

  // https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
  const teacher = req.nextUrl.searchParams.get("teacher");
  // || "Alfie";
  console.log(`Using teacher: ${teacher}`);
  speechConfig.speechSynthesisVoiceName = `en-GB-${teacher}Neural`;

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);
  const visemes = [];
  speechSynthesizer.visemeReceived = function (s, e) {
    console.log(
      "(Viseme), Audio offset:" +
        e.audioOffset / 1000 +
        "ms, Viseme ID: " +
        e.visemeId
    );
    visemes.push([e.audioOffset / 10000, e.visemeId]);
  };

  try {
    const audioStream = await new Promise((resolve, reject) => {
      speechSynthesizer.speakTextAsync(
        req.nextUrl.searchParams.get("text") ||
          "I'm excited to try text to speech",
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const { audioData } = result;
            speechSynthesizer.close();

            // convert arrayBuffer to stream
            const bufferStream = new PassThrough();
            bufferStream.end(Buffer.from(audioData));
            resolve(bufferStream);
          } else {
            console.error("Speech synthesis failed:", result.errorDetails);
            speechSynthesizer.close();
            reject(new Error(result.errorDetails));
          }
        },
        (error) => {
          console.error("Speech synthesis error:", error);
          speechSynthesizer.close();
          reject(error);
        }
      );
    });

    const response = new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename=tts.mp3`,
        Visemes: JSON.stringify(visemes),
      },
    });
    return response;
  } catch (error) {
    console.error("Error during speech synthesis:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
