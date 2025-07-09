import React, { useState } from "react";

export default function LanguageSelector({ language, setLanguage }) {
  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en-US">English</option>
        <option value="fr-GB">French</option>
      </select>
    </div>
  );
}
