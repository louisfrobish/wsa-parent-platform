"use client";

import { useEffect, useState, useTransition } from "react";
import { CopyFacebookCaptionButton } from "@/components/copy-facebook-caption-button";
import { HistoryList } from "@/components/history-list";
import { LocationContextFields } from "@/components/location-context-fields";
import { MarkCompleteCard } from "@/components/mark-complete-card";
import { RecommendedSpotsList } from "@/components/recommended-spots-list";
import { SpeciesPhotoGallery } from "@/components/species-photo-gallery";
import type { AnimalOutput, GenerationRecord } from "@/lib/generations";
import type { StudentRecord } from "@/lib/students";

type AnimalGeneratorProps = {
  initialHistory: GenerationRecord[];
  students: StudentRecord[];
  preselectedStudentId?: string;
};

type AnimalResponse = {
  generation: GenerationRecord;
  output: AnimalOutput;
};

export function AnimalGenerator({ initialHistory, students, preselectedStudentId }: AnimalGeneratorProps) {
  const [history, setHistory] = useState(initialHistory);
  const [result, setResult] = useState<AnimalOutput | null>(null);
  const [latestGenerationId, setLatestGenerationId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId ?? "");
  const [locationLabel, setLocationLabel] = useState("Southern Maryland");
  const [radiusMiles, setRadiusMiles] = useState("10");
  const [weatherCondition, setWeatherCondition] = useState("clear");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  return (
    <section className="content-grid">
      <article className="panel stack">
        <div>
          <p className="eyebrow">Explorer briefing setup</p>
          <h3>Build today&apos;s animal field briefing</h3>
          <p className="panel-copy">Enter a specific animal or choose surprise me for a fresh wildlife briefing with nearby habitat clues and a simple family mission.</p>
        </div>

        {students.length ? (
          <label>
            Student
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="panel-copy">Add a student profile to connect animal studies to a child and unlock badge progress.</p>
        )}

        <LocationContextFields
          locationLabel={locationLabel}
          radiusMiles={radiusMiles}
          weatherCondition={weatherCondition}
          onLocationLabelChange={(value) => setLocationLabel(value)}
          onRadiusMilesChange={(value) => setRadiusMiles(value)}
          onWeatherConditionChange={(value) => setWeatherCondition(value)}
          onCoordinatesResolved={({ latitude: nextLat, longitude: nextLng, locationLabel: nextLabel }) => {
            setLatitude(nextLat);
            setLongitude(nextLng);
            setLocationLabel(nextLabel);
          }}
        />

        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              const response = await fetch("/api/generate-animal", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  animalName: String(formData.get("animalName") || "surprise me"),
                  childAge: Number(formData.get("childAge") || 8),
                  studentId: selectedStudentId || undefined,
                  studentName: students.find((student) => student.id === selectedStudentId)?.name,
                  locationLabel,
                  radiusMiles: Number(radiusMiles),
                  weatherCondition,
                  latitude,
                  longitude
                })
              });

              const payload = (await response.json()) as AnimalResponse | { error: string };

              if (!response.ok || "error" in payload) {
                setError("error" in payload ? payload.error : "Animal generation failed.");
                return;
              }

              setResult(payload.output);
              setLatestGenerationId(payload.generation.id);
              setHistory((current) => [payload.generation, ...current]);
            });
          }}
        >
          <label>
            Animal name or surprise me
            <input name="animalName" placeholder="owl, fox, horseshoe crab, or surprise me" defaultValue="surprise me" />
          </label>
          <label>
            Child age
            <input name="childAge" type="number" min={3} max={18} defaultValue={8} required />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate animal of the day"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>

        {latestGenerationId ? (
          <MarkCompleteCard studentId={selectedStudentId || null} generationId={latestGenerationId} compact />
        ) : null}
      </article>

      <article className="panel stack">
        <div>
          <p className="eyebrow">Today&apos;s wildlife note</p>
          <h3>{result?.animalName || "No animal generated yet"}</h3>
        </div>

        {result ? (
          <div className="stack">
            {result.images?.length ? <SpeciesPhotoGallery title={result.animalName} images={result.images} /> : null}
            <div>
              <h4>Fun facts</h4>
              <ul className="result-list">
                {result.funFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <div className="result-sections">
              <section>
                <h4>Habitat</h4>
                <p>{result.habitat}</p>
              </section>
              {result.likelyHabitatType ? (
                <section>
                  <h4>Likely habitat type</h4>
                  <p>{result.likelyHabitatType}</p>
                </section>
              ) : null}
              <section>
                <h4>Diet</h4>
                <p>{result.diet}</p>
              </section>
              <section>
                <h4>Tracks and sign</h4>
                <p>{result.tracksAndSign}</p>
              </section>
              <section>
                <h4>Kid challenge</h4>
                <p>{result.kidChallenge}</p>
              </section>
              <section>
                <h4>Drawing prompt</h4>
                <p>{result.drawingPrompt}</p>
              </section>
              <section>
                <h4>Journal prompt</h4>
                <p>{result.journalPrompt}</p>
              </section>
              <section>
                <h4>Safety note</h4>
                <p>{result.safetyNote}</p>
              </section>
              {result.bestNearbyPlaceType ? (
                <section>
                  <h4>Best nearby place to start</h4>
                  <p>{result.bestNearbyPlaceType}</p>
                </section>
              ) : null}
              {result.whyThisPlaceFits ? (
                <section>
                  <h4>Why this is a strong local fit</h4>
                  <p>{result.whyThisPlaceFits}</p>
                </section>
              ) : null}
              {result.bestTimeWindow ? (
                <section>
                  <h4>Best time to look today</h4>
                  <p>{result.bestTimeWindow}</p>
                </section>
              ) : null}
              {result.whatToBring?.length ? (
                <section>
                  <h4>What to bring</h4>
                  <ul className="result-list result-list-tight">
                    {result.whatToBring.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section>
                <h4>Facebook caption</h4>
                <p>{result.facebookCaption}</p>
                <div className="cta-row" style={{ marginTop: 12 }}>
                  <CopyFacebookCaptionButton caption={result.facebookCaption} />
                </div>
              </section>
              <section>
                <h4>Printable summary</h4>
                <p>{result.printableSummary}</p>
              </section>
            </div>
            <RecommendedSpotsList
              title="Nearby places that fit today"
              items={result.recommendedNearbySpots ?? []}
              emptyMessage="No local spot recommendations were available yet. Try a clearer region or use current location."
            />
          </div>
        ) : (
          <p className="panel-copy">Generated animal content will appear here after you submit the form.</p>
        )}
      </article>

      <article className="panel stack" style={{ gridColumn: "1 / -1" }}>
        <div>
          <p className="eyebrow">Field archive</p>
          <h3>Recent animal briefings</h3>
        </div>
        <HistoryList items={history} emptyMessage="Animal generations will appear here after the first successful run." />
      </article>
    </section>
  );
}
