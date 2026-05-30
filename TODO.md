# TODO - AI-Powered Resume Builder fixes

- [ ] Inspect remaining frontend page(s) for ATS results route (/ats/:id)
- [x] Fix backend `/api/ats-optimize` to use GPT-5 API instead of HuggingFace Mistral

- [ ] Ensure backend JSON response strictly matches contract
- [ ] Fix `/api/resumes/:id/ats-check` so it doesn’t recursively call localhost incorrectly
- [ ] Validate frontend payload types and navigation for `/ats/:id`
- [ ] Run backend + frontend and verify end-to-end ATS check

