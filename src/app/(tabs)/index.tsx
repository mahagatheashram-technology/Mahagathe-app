import { Screen } from '@/components/ui';
import { useCurrentTime, useContinueReading, useGroupCount, useMandala, useTodayPractice, useTodayVakyam } from '@/data';
import { ComingUp } from '@/features/home/ComingUp';
import { ContinueReading } from '@/features/home/ContinueReading';
import { ParamparaCard } from '@/features/home/ParamparaCard';
import { PracticeCard } from '@/features/home/PracticeCard';
import { SmallStepLine } from '@/features/home/SmallStepLine';
import { VakyamHero } from '@/features/home/VakyamHero';

export default function HomeScreen() {
  const vakyam = useTodayVakyam();
  const practice = useTodayPractice();
  const mandala = useMandala();
  const group = useGroupCount();
  const reading = useContinueReading();
  const now = new Date(useCurrentTime());

  return (
    <Screen edgeToEdgeTop>
      <VakyamHero vakyam={vakyam} now={now} />
      <PracticeCard practice={practice} mandala={mandala} group={group} />
      <SmallStepLine />
      <ContinueReading reading={reading} />
      <ComingUp />
      <ParamparaCard />
    </Screen>
  );
}
