-- CreateTable
CREATE TABLE "_SavedJobs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SavedJobs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SavedJobs_B_index" ON "_SavedJobs"("B");

-- AddForeignKey
ALTER TABLE "_SavedJobs" ADD CONSTRAINT "_SavedJobs_A_fkey" FOREIGN KEY ("A") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedJobs" ADD CONSTRAINT "_SavedJobs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
