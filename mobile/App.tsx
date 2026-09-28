import AsyncStorage from '@react-native-async-storage/async-storage';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, useFonts as useOutfit } from '@expo-google-fonts/outfit';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts as useJakarta } from '@expo-google-fonts/plus-jakarta-sans';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { APPROACH_CHAPTERS, INITIAL_ASSESSMENT, INITIAL_MODULES, type AssessmentQuestion, type LearningModule } from './src/content';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Dumbbell,
  Flame,
  GraduationCap,
  House,
  LockKeyhole,
  LogOut,
  Medal,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { bestStrikeRun, getFrames, nextRollLimit, rollLabel, scoreGame } from './src/scoring';

type Role = 'player' | 'coach' | 'admin';
type Tab = 'home' | 'learn' | 'train' | 'match' | 'profile' | 'roster' | 'plans' | 'feedback' | 'content' | 'accounts' | 'audit' | 'leaderboard' | 'notifications' | 'lesson' | 'student' | 'content-editor' | 'assessment-editor';
type MatchRecord = { id: string; date: string; score: number; mode: 'official' | 'practice'; rolls: number[] };
type FeedbackRecord = { id: string; player: string; message: string; date: string };
type TrainingPlan = { id: string; title: string; playerId: string; weeklySessions: number; progress: number; target: string };
type AcademyLesson = { id: string; moduleId: string; title: string; detail: string; duration: string; icon: LucideIcon };

const C = {
  bg: '#0B1326',
  panel: '#131B2E',
  panel2: '#171F33',
  panel3: '#222A3D',
  line: '#303950',
  text: '#F3F5FC',
  muted: '#AAB2C7',
  dim: '#79839B',
  blue: '#4B78FF',
  blueSoft: '#1D336A',
  amber: '#FFB95F',
  amberSoft: '#493318',
  mint: '#4EDEA3',
  mintSoft: '#143C32',
  red: '#F18B91',
};

const STORE_KEY = 'bowlingpro-native-v1';
const LOGIN_SECURITY_KEY = 'bowlingpro-login-security-v1';
const SEED_COMPLETED_LESSONS = ['technique:stance', 'technique:approach', 'technique:release', 'technique:spare'];
const lessonList = [
  { id: 'stance', title: 'Postura y agarre', detail: 'La base para un lanzamiento repetible', icon: Target, duration: '8 min' },
  { id: 'approach', title: 'Aproximación de 4 pasos', detail: 'Ritmo, equilibrio y sincronización', icon: Activity, duration: '12 min' },
  { id: 'release', title: 'Péndulo y suelta', detail: 'Controla la trayectoria de la bola', icon: TrendingUp, duration: '10 min' },
  { id: 'spare', title: 'Conversión de spares', detail: 'Ajustes para cerrar marcos abiertos', icon: Target, duration: '9 min' },
  { id: 'line', title: 'Lectura de pista', detail: 'Encuentra tu línea de juego', icon: BarChart3, duration: '14 min' },
  { id: 'mental', title: 'Rutina de competencia', detail: 'Una rutina sólida antes de cada tiro', icon: Sparkles, duration: '7 min' },
];
const featuredLesson: AcademyLesson = { id: 'technique:approach', moduleId: 'technique', title: 'Aproximación de 4 pasos', detail: 'Encuentra un ritmo constante entre el paso inicial, el péndulo y la suelta.', icon: Activity, duration: '12 min' };

const assignedPlayers = [
  { id: 'mateo', name: 'Mateo Morales', level: 'Intermedio', average: 188, progress: 68, needsReview: true, initials: 'MM' },
  { id: 'lucia', name: 'Lucía Herrera', level: 'Principiante', average: 142, progress: 82, needsReview: true, initials: 'LH' },
  { id: 'diego', name: 'Diego Salas', level: 'Avanzado', average: 207, progress: 91, needsReview: false, initials: 'DS' },
];

const seedMatches: MatchRecord[] = [
  { id: 'm1', date: 'Hoy', score: 198, mode: 'official', rolls: [] },
  { id: 'm2', date: 'Ayer', score: 176, mode: 'official', rolls: [] },
  { id: 'm3', date: 'Lun, 16 jun', score: 204, mode: 'official', rolls: [] },
  { id: 'm4', date: 'Dom, 15 jun', score: 185, mode: 'practice', rolls: [] },
  { id: 'm5', date: 'Vie, 13 jun', score: 168, mode: 'official', rolls: [] },
];

const INITIAL_PLANS: TrainingPlan[] = [
  { id: 'plan-mateo', title: 'Consistencia y conversión', playerId: 'mateo', weeklySessions: 4, progress: 72, target: 'Elevar conversión de spares al 82%' },
  { id: 'plan-lucia', title: 'Fundamentos de lanzamiento', playerId: 'lucia', weeklySessions: 3, progress: 48, target: 'Afirmar postura y aproximación' },
  { id: 'plan-diego', title: 'Preparación competitiva', playerId: 'diego', weeklySessions: 5, progress: 90, target: 'Mantener promedio sobre 200' },
];

const appTabs: Record<Role, { key: Tab; label: string; icon: LucideIcon }[]> = {
  player: [
    { key: 'home', label: 'Inicio', icon: House },
    { key: 'learn', label: 'Academia', icon: BookOpen },
    { key: 'train', label: 'Entrena', icon: Dumbbell },
    { key: 'match', label: 'Partida', icon: Trophy },
    { key: 'profile', label: 'Perfil', icon: UserRound },
  ],
  coach: [
    { key: 'roster', label: 'Equipo', icon: Users },
    { key: 'plans', label: 'Planes', icon: ClipboardList },
    { key: 'feedback', label: 'Feedback', icon: MessageCircle },
    { key: 'profile', label: 'Perfil', icon: UserRound },
  ],
  admin: [
    { key: 'content', label: 'Contenido', icon: BookOpen },
    { key: 'accounts', label: 'Cuentas', icon: Users },
    { key: 'audit', label: 'Auditoría', icon: ShieldCheck },
    { key: 'profile', label: 'Perfil', icon: UserRound },
  ],
};

const roleStartTab: Record<Role, Tab> = { player: 'home', coach: 'roster', admin: 'content' };

function getModuleLessonId(module: LearningModule, index: number, title: string) {
  const lessonId = lessonList.find((lesson) => lesson.title === title)?.id ?? String(index + 1);
  return `${module.id}:${lessonId}`;
}

function Label({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

function Heading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.headingRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Pressable onPress={onAction}><Text style={styles.actionText}>{action}</Text></Pressable>}
    </View>
  );
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Pill({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'mint' | 'neutral' }) {
  return <View style={[styles.pill, tone === 'amber' && styles.pillAmber, tone === 'mint' && styles.pillMint, tone === 'neutral' && styles.pillNeutral]}><Text style={[styles.pillText, tone === 'amber' && { color: C.amber }, tone === 'mint' && { color: C.mint }, tone === 'neutral' && { color: C.muted }]}>{children}</Text></View>;
}

function ActionButton({
  label,
  onPress,
  icon: Glyph,
  variant = 'primary',
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'quiet' | 'amber';
  disabled?: boolean;
  style?: object;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'quiet' && styles.buttonQuiet,
        variant === 'amber' && styles.buttonAmber,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {Glyph && <Glyph size={17} color={variant === 'secondary' || variant === 'quiet' ? C.text : variant === 'amber' ? C.bg : '#FFFFFF'} strokeWidth={2} />}
      <Text style={[styles.buttonText, (variant === 'secondary' || variant === 'quiet') && { color: C.text }, variant === 'amber' && { color: C.bg }, disabled && { color: C.dim }]}>{label}</Text>
    </Pressable>
  );
}

function Meter({ progress, color = C.blue }: { progress: number; color?: string }) {
  return <View style={styles.meterTrack}><View style={[styles.meterFill, { width: `${Math.max(0, Math.min(progress, 100))}%`, backgroundColor: color }]} /></View>;
}

function StatTile({ label, value, note, icon: Glyph, tone = 'blue' }: { label: string; value: string; note: string; icon: LucideIcon; tone?: 'blue' | 'amber' | 'mint' }) {
  const color = tone === 'amber' ? C.amber : tone === 'mint' ? C.mint : C.blue;
  return (
    <View style={styles.statTile}>
      <View style={styles.statTop}><Label>{label}</Label><Glyph size={16} color={color} /></View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

function Header({ role, onNotifications, onProfile }: { role: Role; onNotifications: () => void; onProfile: () => void }) {
  const roleLabel = role === 'player' ? 'ATLETA' : role === 'coach' ? 'ENTRENADOR' : 'ADMINISTRACIÓN';
  const portrait = role === 'coach' ? require('./assets/coach.png') : role === 'player' ? require('./assets/player.png') : null;
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>B</Text><View style={styles.brandDot} /></View>
        <View><Text style={styles.brandName}>BowlingPro</Text><Text style={styles.brandCaption}>{roleLabel}</Text></View>
      </View>
      <View style={styles.headerActions}>
        <Pressable onPress={onNotifications} accessibilityLabel="Notificaciones" style={styles.headerIcon}><Bell size={19} color={C.muted} /><View style={styles.notificationDot} /></Pressable>
        <Pressable onPress={onProfile} accessibilityLabel="Perfil" style={styles.headerAvatar}>{portrait ? <Image source={portrait} style={styles.headerAvatarImage} /> : <Text style={styles.avatarInitials}>BP</Text>}</Pressable>
      </View>
    </View>
  );
}

function LoginScreen({ onEnter, onRegister }: { onEnter: (role: Role) => void; onRegister: () => void }) {
  const [role, setRole] = useState<Role>('player');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState({ failedAttempts: 0, lockedUntil: 0 });
  const [securityReady, setSecurityReady] = useState(false);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState('');
  const locked = security.lockedUntil > now;
  const attempts = security.failedAttempts;

  useEffect(() => {
    AsyncStorage.getItem(LOGIN_SECURITY_KEY).then((stored) => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (!stored) return;
      const saved = JSON.parse(stored) as { failedAttempts?: number; lockedUntil?: number };
      if (saved.lockedUntil && saved.lockedUntil > currentTime) {
        setSecurity({ failedAttempts: saved.failedAttempts ?? 0, lockedUntil: saved.lockedUntil });
      }
    }).catch(() => undefined).finally(() => setSecurityReady(true));
  }, []);

  useEffect(() => {
    if (!securityReady) return;
    AsyncStorage.setItem(LOGIN_SECURITY_KEY, JSON.stringify(security)).catch(() => undefined);
  }, [security, securityReady]);

  useEffect(() => {
    if (!security.lockedUntil) return;
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= security.lockedUntil) setSecurity({ failedAttempts: 0, lockedUntil: 0 });
    }, 1000);
    return () => clearInterval(timer);
  }, [security.lockedUntil]);

  const handleLogin = () => {
    if (locked) {
      setNotice('Se alcanzó el límite de intentos. Espera 15 minutos o entra en modo demo.');
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid || password.length < 8) {
      const nextAttempts = attempts + 1;
      setSecurity({ failedAttempts: nextAttempts, lockedUntil: nextAttempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
      setNotice(nextAttempts >= 5 ? 'Acceso bloqueado durante 15 minutos.' : 'Revisa tu correo y contraseña. Se requieren al menos 8 caracteres.');
      return;
    }
    setSecurity({ failedAttempts: 0, lockedUntil: 0 });
    onEnter(role);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.loginContent} keyboardShouldPersistTaps="handled">
        <View style={styles.loginHero}>
          <View style={styles.loginMark}><Text style={styles.loginMarkText}>B</Text><View style={styles.loginOrb} /></View>
          <Pill tone="amber">ENTRENA CON INTENCIÓN</Pill>
          <Text style={styles.loginTitle}>Tu juego,{ '\n' }a otro nivel.</Text>
          <Text style={styles.loginSub}>Aprende la técnica. Registra cada marco. Mejora con datos.</Text>
        </View>
        <Card style={styles.authCard}>
          <Heading title="Iniciar sesión" />
          <View style={styles.segmentRow}>
            {(['player', 'coach', 'admin'] as Role[]).map((item) => (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.segment, role === item && styles.segmentActive]}>
                <Text style={[styles.segmentText, role === item && styles.segmentTextActive]}>{item === 'player' ? 'Jugador' : item === 'coach' ? 'Entrenador' : 'Admin'}</Text>
              </Pressable>
            ))}
          </View>
          <Label>Correo electrónico</Label>
          <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor={C.dim} style={styles.input} />
          <Label style={{ marginTop: 12 }}>Contraseña</Label>
          <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" placeholderTextColor={C.dim} style={styles.input} />
          <Text style={styles.helperText}>{locked ? `Acceso bloqueado · ${Math.ceil((security.lockedUntil - now) / 60000)} min restantes` : `5 intentos fallidos bloquean el acceso durante 15 minutos. ${attempts}/5`}</Text>
          {notice ? <Text style={styles.errorText}>{notice}</Text> : null}
          <ActionButton label="Entrar" icon={ArrowRight} onPress={handleLogin} disabled={locked || !securityReady} style={{ marginTop: 17 }} />
          <ActionButton label="Explorar en modo demo" icon={Sparkles} variant="secondary" onPress={() => onEnter(role)} style={{ marginTop: 9 }} />
          <Pressable onPress={onRegister} style={styles.registerLink}><Text style={styles.registerText}>¿Primera vez en BowlingPro? <Text style={styles.actionText}>Crear cuenta</Text></Text></Pressable>
          <Text style={styles.demoDisclaimer}>Acceso local de demostración. La autenticación real requiere un servicio de cuentas.</Text>
        </Card>
        <View style={styles.loginFoot}><ShieldCheck size={15} color={C.mint} /><Text style={styles.loginFootText}>Tu progreso se guarda en este dispositivo</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RegisterScreen({ onBack, onRegistered }: { onBack: () => void; onRegistered: (role: Role) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'player' | 'coach'>('player');
  const [error, setError] = useState('');
  const createAccount = () => {
    const validPassword = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validPassword) {
      setError('Completa el nombre, usa un correo válido y una contraseña de 8+ caracteres con letras y números.');
      return;
    }
    onRegistered(role);
  };

  return (
    <ScrollView contentContainerStyle={styles.loginContent} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver al acceso</Text></Pressable>
      <View style={styles.loginHero}><Pill tone="amber">EMPIEZA HOY</Pill><Text style={styles.loginTitle}>Crea tu cuenta.</Text><Text style={styles.loginSub}>Un perfil, un plan y cada partida en un solo lugar.</Text></View>
      <Card style={styles.authCard}>
        <Heading title="Tus datos" />
        <View style={styles.segmentRow}>
          {(['player', 'coach'] as const).map((item) => <Pressable key={item} onPress={() => setRole(item)} style={[styles.segment, role === item && styles.segmentActive]}><Text style={[styles.segmentText, role === item && styles.segmentTextActive]}>{item === 'player' ? 'Jugador' : 'Entrenador'}</Text></Pressable>)}
        </View>
        <Label>Nombre completo</Label><TextInput value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={C.dim} style={styles.input} />
        <Label style={{ marginTop: 12 }}>Correo electrónico</Label><TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor={C.dim} style={styles.input} />
        <Label style={{ marginTop: 12 }}>Contraseña</Label><TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="8+ caracteres, letras y números" placeholderTextColor={C.dim} style={styles.input} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <ActionButton label="Crear cuenta" icon={ArrowRight} onPress={createAccount} style={{ marginTop: 17 }} />
        <Text style={styles.demoDisclaimer}>El registro valida tus datos localmente. La creación de cuentas reales se conectará a un backend.</Text>
      </Card>
    </ScrollView>
  );
}

function PlayerHome({ history, lessonCount, assessmentScore, challengeProgress, modules, onStartMatch, onNavigate }: {
  history: MatchRecord[]; lessonCount: string[]; assessmentScore: number | null; challengeProgress: number; modules: LearningModule[]; onStartMatch: () => void; onNavigate: (tab: Tab) => void;
}) {
  const avg = history.length ? Math.round(history.reduce((sum, game) => sum + game.score, 0) / history.length) : 0;
  const intermediateModules = modules.filter((module) => module.level === 'Intermedio' && module.published);
  const requiredLessons = intermediateModules.reduce((total, module) => total + module.lessons.length, 0) || lessonList.length;
  const completedLevelLessons = intermediateModules.reduce((total, module) => total + module.lessons.reduce((count, title, index) => count + (lessonCount.includes(getModuleLessonId(module, index, title)) ? 1 : 0), 0), 0);
  const advanced = completedLevelLessons >= requiredLessons && assessmentScore !== null && assessmentScore >= 80;
  const levelProgress = advanced ? 100 : Math.min(68 + Math.max(0, completedLevelLessons - Math.max(0, requiredLessons - 2)) * 10, 98);
  const levelMessage = advanced
    ? 'Requisitos completados. El nivel avanzado está desbloqueado.'
    : intermediateModules.length === 0
      ? 'El módulo intermedio no está publicado todavía.'
      : completedLevelLessons < requiredLessons
        ? `Completa ${requiredLessons - completedLevelLessons} lecciones y aprueba la evaluación con 80% para avanzar.`
      : 'Lecciones completadas. Aprueba la evaluación con 80% para desbloquear el nivel avanzado.';
  return (
    <View style={styles.screenStack}>
      <View style={styles.greetingRow}><View><Label>MIÉRCOLES · SESIÓN DE PISTA</Label><Text style={styles.greeting}>Hola, Mateo</Text><Text style={styles.bodyMuted}>Un tiro a la vez. Vamos por más.</Text></View><View style={styles.streak}><Flame size={16} color={C.amber} /><Text style={styles.streakText}>4 días</Text></View></View>
      <Card style={styles.levelCard}>
        <View style={styles.levelTop}><View><Label>NIVEL ACTUAL</Label><Text style={styles.levelName}>{advanced ? 'Avanzado' : 'Intermedio'}</Text></View><Pill tone="amber">{advanced ? 'DESBLOQUEADO' : `${levelProgress}% COMPLETADO`}</Pill></View>
        <View style={styles.levelTrack}><View style={styles.levelStepDone}><Check size={12} color={C.bg} /></View><View style={styles.levelBar}><Meter progress={levelProgress} color={C.amber} /></View><View style={[styles.levelStepLocked, advanced && styles.levelStepDone]}>{advanced ? <Check size={12} color={C.bg} /> : <LockKeyhole size={12} color={C.dim} />}</View></View>
        <View style={styles.levelLabels}><Text style={styles.smallText}>Principiante · aprobado</Text><Text style={styles.smallText}>{advanced ? 'Avanzado' : 'Intermedio'}</Text></View>
        <View style={styles.levelNote}><LockKeyhole size={15} color={advanced ? C.mint : C.amber} /><Text style={styles.levelNoteText}>{levelMessage}</Text></View>
      </Card>
      <Card style={styles.matchHero}>
        <View style={styles.heroTop}><View><Pill tone="amber">EN LA PISTA</Pill><Text style={styles.matchTitle}>¿Una partida?</Text><Text style={styles.bodyMuted}>Tu marcador oficial, sin cálculos.</Text></View><View style={styles.heroIcon}><Trophy size={25} color={C.amber} /></View></View>
        <View style={styles.modePreview}><Text style={styles.smallText}>PARTIDA DE 10 MARCOS</Text><Text style={styles.monoSmall}>STRIKE · SPARE · OPEN</Text></View>
        <ActionButton label="Registrar partida" icon={ArrowRight} onPress={onStartMatch} />
      </Card>
      <View><Heading title="Tu temporada" action="Ver historial" onAction={() => onNavigate('profile')} /><View style={styles.statGrid}><StatTile label="PROMEDIO" value={avg ? `${avg}` : '—'} note={history.length ? `${history.length} partidas registradas` : 'Aún sin partidas'} icon={BarChart3} /><StatTile label="MEJOR JUEGO" value={`${Math.max(0, ...history.map((game) => game.score)) || '—'}`} note="Puntaje más alto" icon={Trophy} tone="amber" /></View></View>
      <Card>
        <View style={styles.challengeTop}><View style={styles.challengeIcon}><Flame size={19} color={C.amber} /></View><View style={styles.flex}><Label>RETO DE LA SEMANA</Label><Text style={styles.cardTitle}>Encadena 3 strikes</Text></View><Pill tone="amber">+150 XP</Pill></View>
        <Text style={styles.bodyMuted}>Solo cuentan los tiros de partidas oficiales guardadas.</Text>
        <View style={styles.challengeBottom}><View style={styles.strikeTokens}>{[0, 1, 2].map((index) => <View key={index} style={[styles.strikeToken, index < challengeProgress && styles.strikeTokenDone]}><Text style={[styles.strikeTokenText, index < challengeProgress && { color: C.bg }]}>{index < challengeProgress ? 'X' : '·'}</Text></View>)}</View><Text style={styles.challengeCount}>{Math.min(challengeProgress, 3)} / 3</Text></View>
      </Card>
      <Pressable onPress={() => onNavigate('leaderboard')} style={styles.leaderboardLink}><View style={styles.leaderboardIcon}><Medal size={18} color={C.amber} /></View><View style={styles.flex}><Label>LIGA METROPOLITANA</Label><Text style={styles.cardTitle}>Tabla de clasificación</Text></View><ChevronRight size={18} color={C.muted} /></Pressable>
      <View><Heading title="Evolución reciente" action="Ver todo" onAction={() => onNavigate('profile')} /><Card style={styles.chartCard}><View style={styles.chartTop}><View><Label>PUNTAJE POR PARTIDA</Label><Text style={styles.chartAverage}>{avg || '—'} <Text style={styles.smallText}>promedio</Text></Text></View><View style={styles.trendBadge}><TrendingUp size={14} color={C.mint} /><Text style={styles.trendText}>en progreso</Text></View></View><View style={styles.barChart}>{history.slice(0, 6).reverse().map((game) => <View key={game.id} style={styles.barColumn}><Text style={styles.barValue}>{game.score}</Text><View style={[styles.chartBar, { height: `${Math.max(18, Math.round(game.score / 2.5))}%` }]} /><Text style={styles.barDate}>{game.date.split(',')[0].slice(0, 3)}</Text></View>)}</View></Card></View>
      <Card style={styles.lessonPrompt}><View style={styles.lessonPromptIcon}><GraduationCap size={20} color={C.blue} /></View><View style={styles.flex}><Label>CONTINÚA TU RUTA</Label><Text style={styles.cardTitle}>Aproximación de 4 pasos</Text><Text style={styles.smallText}>12 min · Técnica de lanzamiento</Text></View><Pressable onPress={() => onNavigate('learn')} style={styles.roundArrow}><ChevronRight size={19} color={C.text} /></Pressable></Card>
    </View>
  );
}

function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<'Temporada' | 'Este mes'>('Temporada');
  const players = [
    { rank: 1, name: 'Diego Salas', avg: period === 'Temporada' ? 207 : 211, games: 24, initials: 'DS' },
    { rank: 2, name: 'Sofía Rojas', avg: period === 'Temporada' ? 201 : 204, games: 22, initials: 'SR' },
    { rank: 3, name: 'Nicolás Vega', avg: period === 'Temporada' ? 194 : 198, games: 18, initials: 'NV' },
    { rank: 4, name: 'Mateo Morales', avg: period === 'Temporada' ? 188 : 192, games: 16, initials: 'MM' },
    { rank: 5, name: 'Lucía Herrera', avg: period === 'Temporada' ? 142 : 151, games: 13, initials: 'LH' },
  ];
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver al inicio</Text></Pressable>
      <View><Pill tone="amber">LIGA METROPOLITANA</Pill><Text style={styles.pageTitle}>Clasificación</Text><Text style={styles.bodyMuted}>Promedios de partidas oficiales del grupo.</Text></View>
      <View style={styles.segmentRow}>{(['Temporada', 'Este mes'] as const).map((item) => <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.segment, period === item && styles.segmentActive]}><Text style={[styles.segmentText, period === item && styles.segmentTextActive]}>{item}</Text></Pressable>)}</View>
      <Card style={styles.leaderboardHero}><Trophy size={23} color={C.amber} /><Label>TU POSICIÓN ACTUAL</Label><Text style={styles.leaderboardRank}>#4 <Text style={styles.leaderboardRankTail}>de 24 jugadores</Text></Text><Text style={styles.bodyMuted}>A 6 puntos de promedio para entrar al top 3.</Text></Card>
      <View style={styles.rankingList}>{players.map((player) => <Card key={player.rank} style={[styles.rankingRow, player.rank === 4 && styles.rankingRowYou]}><Text style={[styles.rankNumber, player.rank <= 3 && { color: C.amber }]}>{String(player.rank).padStart(2, '0')}</Text><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>{player.initials}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{player.name}{player.rank === 4 ? ' · Tú' : ''}</Text><Text style={styles.smallText}>{player.games} partidas · {period.toLowerCase()}</Text></View><View style={styles.rankingAverage}><Text style={styles.rankingScore}>{player.avg}</Text><Text style={styles.smallText}>PROM.</Text></View></Card>)}</View>
      <View style={styles.ruleHint}><ShieldCheck size={15} color={C.mint} /><Text style={styles.smallText}>La clasificación usa los resultados de partidas oficiales registradas.</Text></View>
    </View>
  );
}

function NotificationsScreen({ role, onBack }: { role: Role; onBack: () => void }) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const name = role === 'coach' ? 'Mateo Morales' : 'Carlos Méndez';
  const events = [
    { id: 'training', title: 'Tu sesión de entrenamiento te espera', detail: 'Plan semanal · 3 ejercicios pendientes', time: 'Hoy · 9:00', icon: Dumbbell, tone: 'amber' as const },
    { id: 'feedback', title: role === 'player' ? 'Carlos te dejó una recomendación' : 'Mateo registró una nueva partida', detail: role === 'player' ? 'Revisa el feedback de tu última sesión' : 'Partida oficial · 198 puntos', time: 'Ayer · 17:30', icon: MessageCircle, tone: 'blue' as const },
    { id: 'lesson', title: 'Nueva lección disponible', detail: 'Lectura de pista y ajustes de línea', time: 'Ayer · 12:15', icon: BookOpen, tone: 'mint' as const },
    { id: 'league', title: 'Actualización de la Liga Metropolitana', detail: `${name} está en el top 5 del grupo`, time: 'Lun · 10:42', icon: Trophy, tone: 'amber' as const },
  ];
  const unread = events.filter((event) => !readIds.includes(event.id)).length;
  const markAll = () => setReadIds(events.map((event) => event.id));
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver</Text></Pressable>
      <View style={styles.notificationsHeading}><View><Pill tone="amber">ACTIVIDAD RECIENTE</Pill><Text style={styles.pageTitle}>Notificaciones</Text></View>{unread > 0 && <Pressable onPress={markAll}><Text style={styles.actionText}>Marcar leídas</Text></Pressable>}</View>
      <Text style={styles.bodyMuted}>{unread > 0 ? `${unread} notificaciones sin leer` : 'Estás al día con toda tu actividad.'}</Text>
      {events.map((event) => {
        const Glyph = event.icon;
        const isRead = readIds.includes(event.id);
        return <Pressable key={event.id} onPress={() => setReadIds((current) => isRead ? current : [...current, event.id])}><Card style={[styles.notificationCard, isRead && styles.notificationRead]}><View style={[styles.notificationIcon, event.tone === 'amber' && styles.notificationAmber, event.tone === 'mint' && styles.notificationMint]}><Glyph size={18} color={event.tone === 'amber' ? C.amber : event.tone === 'mint' ? C.mint : C.blue} /></View><View style={styles.flex}><View style={styles.notificationTitleRow}><Text style={[styles.cardTitle, styles.flex]}>{event.title}</Text>{!isRead && <View style={styles.reviewDot} />}</View><Text style={styles.bodyMuted}>{event.detail}</Text><Text style={styles.smallText}>{event.time}</Text></View></Card></Pressable>;
      })}
    </View>
  );
}

function AcademyScreen({ completed, assessmentScore, questions, modules, onAssess, onOpenLesson }: { completed: string[]; assessmentScore: number | null; questions: AssessmentQuestion[]; modules: LearningModule[]; onAssess: (score: number) => void; onOpenLesson: (lesson: AcademyLesson) => void }) {
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [query, setQuery] = useState('');
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const visibleModules = modules.filter((module) => module.published);
  if (visibleModules.length === 0) return <View style={styles.screenStack}><View><Pill tone="amber">ACADEMIA BOWLINGPRO</Pill><Text style={styles.pageTitle}>Ruta de maestría</Text></View><Card><Text style={styles.cardTitle}>No hay módulos publicados</Text><Text style={styles.bodyMuted}>Vuelve cuando el administrador publique contenido de aprendizaje.</Text></Card></View>;
  const activeModules = visibleModules.filter((module) => module.level === level);
  const activeModule = activeModules[0] ?? visibleModules[0];
  const moduleLessons = activeModules.flatMap((module) => module.lessons.map((title, index) => {
    const catalogLesson = lessonList.find((lesson) => lesson.title === title);
    return {
      id: getModuleLessonId(module, index, title),
      moduleId: module.id,
      title,
      detail: catalogLesson?.detail ?? 'Lección de este módulo formativo',
      duration: catalogLesson?.duration ?? '8 min',
      icon: catalogLesson?.icon ?? BookOpen,
      moduleTitle: module.title,
    };
  }));
  const intermediateModules = visibleModules.filter((module) => module.level === 'Intermedio');
  const intermediateCount = intermediateModules.reduce((total, module) => total + module.lessons.length, 0) || lessonList.length;
  const completedIntermediateCount = intermediateModules.reduce((total, module) => total + module.lessons.reduce((count, title, index) => count + (completed.includes(getModuleLessonId(module, index, title)) ? 1 : 0), 0), 0);
  const locked = intermediateModules.length === 0 || completedIntermediateCount < intermediateCount || assessmentScore === null || assessmentScore < 80;
  const answerQuestion = (answer: number) => {
    const question = questions[quizIndex];
    const correct = correctAnswers + (answer === question.correct ? 1 : 0);
    if (quizIndex < questions.length - 1) {
      setCorrectAnswers(correct);
      setQuizIndex((current) => current + 1);
      return;
    }
    const score = Math.round(correct / questions.length * 100);
    onAssess(score);
    setQuizOpen(false);
    setQuizIndex(0);
    setCorrectAnswers(0);
    Alert.alert(score >= 80 ? 'Nivel aprobado' : 'Evaluación finalizada', `Resultado: ${score}%. ${score >= 80 ? 'Se desbloqueó el nivel avanzado.' : 'Necesitas al menos 80% para avanzar.'}`);
  };
  const terms = [
    ['Strike', 'Derribar los diez pinos con el primer lanzamiento del marco.'],
    ['Spare', 'Derribar los pinos restantes con el segundo lanzamiento.'],
    ['Split', 'Dos o más pinos separados que quedan tras el primer tiro.'],
    ['Marco', 'Cada turno del juego; hay diez marcos en una partida.'],
  ].filter(([term, detail]) => `${term} ${detail}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.screenStack}>
      <View><Pill tone="amber">ACADEMIA BOWLINGPRO</Pill><Text style={styles.pageTitle}>Ruta de maestría</Text><Text style={styles.bodyMuted}>Aprende a tu ritmo. Cada nivel se gana en la pista.</Text></View>
      <View style={styles.levelSelector}>{(['Principiante', 'Intermedio', 'Avanzado'] as const).map((item, index) => {
        const levelModule = visibleModules.find((module) => module.level === item);
        const isLocked = (index === 2 && locked) || !levelModule;
        const completedCount = levelModule?.lessons.reduce((count, title, lessonIndex) => count + (completed.includes(getModuleLessonId(levelModule, lessonIndex, title)) ? 1 : 0), 0) ?? 0;
        const progress = index === 0 ? 100 : index === 1 ? Math.round(completedCount / Math.max(1, levelModule?.lessons.length ?? 1) * 100) : locked ? 0 : 100;
        return <Pressable key={item} disabled={isLocked} onPress={() => setLevel(item)} style={[styles.levelOption, level === item && styles.levelOptionActive, isLocked && styles.levelOptionLocked]}><View style={styles.levelOptionTop}><Text style={[styles.levelOptionIndex, level === item && { color: C.amber }]}>0{index + 1}</Text>{isLocked ? <LockKeyhole size={13} color={C.dim} /> : index === 0 ? <CheckCircle2 size={14} color={C.mint} /> : null}</View><Text numberOfLines={1} style={[styles.levelOptionName, level === item && { color: C.text }]}>{item}</Text><Meter progress={progress} color={index === 0 ? C.mint : C.amber} /></Pressable>;
      })}</View>
      <Pressable onPress={() => onOpenLesson(featuredLesson)}><Card style={styles.recommendedCard}><View style={styles.recommendedTop}><Pill tone="amber">RECOMENDADO · 12 MIN</Pill><BookOpen size={19} color={C.amber} /></View><Text style={styles.cardTitleLarge}>Aproximación de 4 pasos</Text><Text style={styles.bodyMuted}>Encuentra un ritmo constante entre el paso inicial, el péndulo y la suelta.</Text><View style={styles.lessonVisual}><View style={styles.laneStripe} /><View style={styles.laneStripe} /><View style={styles.laneStripe} /><View style={styles.laneBall}><View style={styles.laneHole} /></View><View style={styles.lanePins}><Text style={styles.lanePinText}>I</Text><Text style={styles.lanePinText}>I</Text><Text style={styles.lanePinText}>I</Text></View><View style={styles.lessonPlay}><ArrowRight size={19} color="#FFFFFF" /></View></View><View style={styles.recommendedFooter}><Text style={styles.smallText}>NIVEL INTERMEDIO · TÉCNICA</Text><Text style={styles.actionText}>Abrir lección  →</Text></View></Card></Pressable>
      <View><Heading title={`Lecciones · ${activeModules.length > 1 ? level : activeModule.title}`} action={`${moduleLessons.filter((lesson) => completed.includes(lesson.id)).length}/${moduleLessons.length}`} /><View style={styles.lessonList}>{moduleLessons.map((lesson, index) => {
        const done = completed.includes(lesson.id);
        const Glyph = lesson.icon;
        return <Card key={lesson.id} style={styles.lessonRow}><View style={[styles.lessonIcon, done && styles.lessonIconDone]}><Glyph size={19} color={done ? C.mint : C.blue} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{lesson.title}</Text><Text style={styles.smallText}>{lesson.detail}</Text><Text style={styles.lessonDuration}>{lesson.duration} · {activeModule.level}</Text></View><Pressable accessibilityLabel={done ? `Repasar ${lesson.title}` : `Abrir ${lesson.title}`} onPress={() => onOpenLesson(lesson)} style={styles.checkButton}>{done ? <CheckCircle2 size={21} color={C.mint} /> : <ArrowRight size={19} color={C.muted} />}</Pressable></Card>;
      })}</View></View>
      <Card style={styles.assessmentCard}>
        <View style={styles.challengeTop}><View style={styles.assessmentIcon}><Medal size={19} color={C.amber} /></View><View style={styles.flex}><Label>EVALUACIÓN DE NIVEL</Label><Text style={styles.cardTitle}>Avanza a avanzado</Text></View>{assessmentScore !== null && <Pill tone={assessmentScore >= 80 ? 'mint' : 'amber'}>{assessmentScore}%</Pill>}</View>
        {quizOpen ? <View style={styles.quizPanel}><Text style={styles.smallText}>PREGUNTA {quizIndex + 1} DE {questions.length}</Text><Meter progress={(quizIndex + 1) / questions.length * 100} color={C.amber} /><Text style={styles.quizQuestion}>{questions[quizIndex].question}</Text>{questions[quizIndex].choices.map((choice, index) => <Pressable key={choice} onPress={() => answerQuestion(index)} style={({ pressed }) => [styles.quizChoice, pressed && styles.pressed]}><Text style={styles.quizChoiceText}>{choice}</Text><ChevronRight size={15} color={C.dim} /></Pressable>)}</View> : <><Text style={styles.bodyMuted}>Completa todas las lecciones del nivel intermedio y obtén al menos 80%. El nivel avanzado permanece bloqueado hasta cumplir ambas condiciones.</Text><ActionButton label={completedIntermediateCount < intermediateCount ? `Completa ${intermediateCount - completedIntermediateCount} lecciones primero` : assessmentScore !== null && assessmentScore >= 80 ? 'Evaluación aprobada' : 'Presentar evaluación'} icon={assessmentScore !== null && assessmentScore >= 80 ? Check : LockKeyhole} variant="secondary" disabled={locked || (assessmentScore !== null && assessmentScore >= 80)} onPress={() => setQuizOpen(true)} style={{ marginTop: 4 }} /></>}
      </Card>
      <View><Heading title="Glosario de bowling" /><View style={styles.searchBar}><Search size={17} color={C.dim} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar un término" placeholderTextColor={C.dim} style={styles.searchInput} /></View><Card style={{ paddingVertical: 3 }}>{terms.map(([term, detail]) => <View key={term} style={styles.glossaryRow}><Text style={styles.glossaryTerm}>{term}</Text><Text style={styles.bodyMuted}>{detail}</Text></View>)}</Card></View>
      <Card><View style={styles.challengeTop}><CircleHelp size={20} color={C.blue} /><Text style={[styles.cardTitle, styles.flex]}>Reglas esenciales</Text></View><Text style={styles.bodyMuted}>Una partida tiene 10 marcos. El strike suma los dos tiros siguientes; el spare, el siguiente. El décimo marco puede tener hasta tres tiros para resolver bonificaciones.</Text></Card>
    </View>
  );
}

function LessonViewer({ completed, lesson, onComplete, onBack }: { completed: string[]; lesson: AcademyLesson; onComplete: () => void; onBack: () => void }) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const chapters = lesson.id === 'technique:approach' ? APPROACH_CHAPTERS : [
    { title: 'Objetivo', body: `${lesson.detail}. Familiarízate con la técnica y define una meta clara antes de empezar.`, cue: 'Empieza con control y una rutina constante.' },
    { title: 'Práctica', body: `Repite ${lesson.title.toLowerCase()} en series cortas. Mantén la postura, respira entre intentos y anota qué ajuste te ayuda.`, cue: 'Prioriza la repetición consistente sobre la potencia.' },
    { title: 'Revisión', body: 'Revisa tus resultados y ajusta un solo aspecto de la técnica cada vez. Pide feedback si el resultado cambia entre intentos.', cue: 'Observa, ajusta y vuelve a intentarlo.' },
  ];
  const chapter = chapters[chapterIndex];
  const isComplete = completed.includes(lesson.id);
  const finishLesson = () => {
    if (chapterIndex < chapters.length - 1) return;
    onComplete();
    Alert.alert('Lección completada', 'La aproximación de 4 pasos quedó guardada en tu progreso.');
  };
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver a la academia</Text></Pressable>
      <View><Pill tone="amber">LECCIÓN GUIADA · {lesson.duration.toUpperCase()}</Pill><Text style={styles.pageTitle}>{lesson.title}</Text><Text style={styles.bodyMuted}>{lesson.detail}</Text></View>
      <View style={styles.lessonPlayerVisual}><View style={styles.lessonLaneCenter}><View style={styles.lessonLaneLine} /><View style={styles.lessonFootsteps}><View style={styles.lessonFootstep}><Text style={styles.lessonFootstepText}>1</Text></View><View style={styles.lessonFootstep}><Text style={styles.lessonFootstepText}>2</Text></View><View style={styles.lessonFootstep}><Text style={styles.lessonFootstepText}>3</Text></View><View style={[styles.lessonFootstep, styles.lessonFootstepActive]}><Text style={[styles.lessonFootstepText, { color: C.bg }]}>4</Text></View></View><View style={styles.lessonArrow}><ArrowRight size={19} color={C.amber} /></View></View><View style={styles.lessonVisualCaption}><Text style={styles.lessonChapterBadge}>{String(chapterIndex + 1).padStart(2, '0')}</Text><Text style={styles.smallText}>SECUENCIA DE APROXIMACIÓN</Text></View></View>
      <View style={styles.chapterProgress}>{chapters.map((item, index) => <Pressable key={item.title} accessibilityLabel={`Capítulo ${index + 1}: ${item.title}`} onPress={() => setChapterIndex(index)} style={[styles.chapterDot, index === chapterIndex && styles.chapterDotActive, index < chapterIndex && styles.chapterDotDone]} />)}</View>
      <Card style={styles.chapterCard}><View style={styles.challengeTop}><View style={styles.chapterNumber}><Text style={styles.chapterNumberText}>{chapterIndex + 1}</Text></View><View style={styles.flex}><Label>CAPÍTULO {chapterIndex + 1} DE {chapters.length}</Label><Text style={styles.cardTitleLarge}>{chapter.title}</Text></View><Pill tone="neutral">TÉCNICA</Pill></View><Text style={styles.chapterBody}>{chapter.body}</Text><View style={styles.lessonCue}><Target size={17} color={C.amber} /><Text style={styles.lessonCueText}>{chapter.cue}</Text></View></Card>
      <View style={styles.chapterControls}><ActionButton label="Anterior" icon={ChevronRight} variant="secondary" disabled={chapterIndex === 0} onPress={() => setChapterIndex((index) => Math.max(0, index - 1))} style={styles.chapterControlButton} /><ActionButton label={chapterIndex === chapters.length - 1 ? 'Finalizar' : 'Siguiente'} icon={ArrowRight} onPress={() => chapterIndex === chapters.length - 1 ? finishLesson() : setChapterIndex((index) => Math.min(chapters.length - 1, index + 1))} style={styles.chapterControlButton} /></View>
      <ActionButton label={isComplete ? 'Lección completada' : chapterIndex < chapters.length - 1 ? 'Continúa para completar' : 'Marcar lección como completada'} icon={isComplete ? CheckCircle2 : Check} variant={isComplete ? 'secondary' : 'primary'} disabled={isComplete || chapterIndex < chapters.length - 1} onPress={finishLesson} />
      <Text style={styles.smallText}>Consejo: practica a velocidad cómoda antes de aumentar la potencia.</Text>
    </View>
  );
}

function TrainingScreen({ completed, onToggle }: { completed: string[]; onToggle: (id: string) => void }) {
  const drills = [
    { id: 'line', name: 'Tiros a la flecha 2', note: 'Precisión · 3 series de 5 tiros', xp: '+80 XP', icon: Target },
    { id: 'release', name: 'Suelta sin tensión', note: 'Técnica · 12 lanzamientos', xp: '+60 XP', icon: Activity },
    { id: 'spares', name: 'Esquina 10 y 7', note: 'Conversión · 10 repeticiones', xp: '+100 XP', icon: Trophy },
  ];
  const doneCount = drills.filter((drill) => completed.includes(drill.id)).length;
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="mint">PLAN ACTIVO · SEMANA 3</Pill><Text style={styles.pageTitle}>Entrena con foco</Text><Text style={styles.bodyMuted}>Tres ejercicios cortos. Un objetivo claro: consistencia.</Text></View>
      <Card style={styles.trainingHero}><View style={styles.heroTop}><View><Label>OBJETIVO DE HOY</Label><Text style={styles.trainingTarget}>Mejorar el spare</Text><Text style={styles.bodyMuted}>Rutina personalizada · Mateo</Text></View><View style={styles.goalRing}><Text style={styles.goalNumber}>{doneCount}/3</Text><Text style={styles.goalCaption}>HECHOS</Text></View></View><Meter progress={doneCount / 3 * 100} color={C.mint} /><Text style={styles.smallText}>Objetivo semanal: 4 sesiones · 2 de 4 completadas</Text></Card>
      <View><Heading title="Sesión de hoy" action="35 min" /><View style={styles.drillList}>{drills.map((drill, index) => {
        const done = completed.includes(drill.id);
        const Glyph = drill.icon;
        return <Card key={drill.id} style={styles.drillCard}><View style={styles.drillTop}><View style={styles.drillIcon}><Glyph size={19} color={C.blue} /></View><Pill tone={done ? 'mint' : 'neutral'}>{done ? 'COMPLETADO' : drill.xp}</Pill></View><Text style={styles.cardTitleLarge}>{drill.name}</Text><Text style={styles.bodyMuted}>{drill.note}</Text><View style={styles.drillBottom}><Text style={styles.smallText}>EJERCICIO 0{index + 1}</Text><Pressable onPress={() => onToggle(drill.id)} style={[styles.drillAction, done && styles.drillActionDone]}><Text style={[styles.drillActionText, done && { color: C.mint }]}>{done ? 'Hecho' : 'Marcar hecho'}</Text>{done ? <Check size={14} color={C.mint} /> : <ArrowRight size={14} color={C.text} />}</Pressable></View></Card>;
      })}</View></View>
      <Card><View style={styles.challengeTop}><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>CM</Text></View><View style={styles.flex}><Label>NOTA DE TU ENTRENADOR</Label><Text style={styles.cardTitle}>Suelta más adelante</Text></View></View><Text style={styles.bodyMuted}>“Prueba a alargar un poco el péndulo antes de soltar. Tu precisión mejora cuando mantienes el hombro relajado.”</Text><Text style={styles.smallText}>Carlos Méndez · Ayer</Text></Card>
    </View>
  );
}

function MatchScreen({ rolls, mode, onModeChange, onRoll, onUndo, onSave }: {
  rolls: number[]; mode: 'official' | 'practice'; onModeChange: (mode: 'official' | 'practice') => void; onRoll: (pins: number) => void; onUndo: () => void; onSave: () => void;
}) {
  const limit = nextRollLimit(rolls);
  const frames = getFrames(rolls);
  const complete = limit === null;
  const score = scoreGame(rolls);
  const currentFrame = frames.find((frame) => frame.score === null) ?? frames[9];
  const shotCount = currentFrame?.rolls.length ?? 0;
  const standings = limit === null ? 0 : limit;

  return (
    <View style={styles.screenStack}>
      <View style={styles.matchHeader}><View><Pill tone={complete ? 'mint' : 'amber'}>{complete ? 'PARTIDA COMPLETA' : 'EN CURSO'}</Pill><Text style={styles.pageTitle}>Marcador</Text></View><Pressable onPress={onUndo} disabled={rolls.length === 0} style={[styles.undoButton, rolls.length === 0 && { opacity: 0.4 }]}><Text style={styles.undoText}>Deshacer</Text></Pressable></View>
      <View style={styles.segmentRow}>{(['official', 'practice'] as const).map((item) => <Pressable key={item} onPress={() => onModeChange(item)} style={[styles.segment, mode === item && styles.segmentActive]}><Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>{item === 'official' ? 'Juego oficial' : 'Práctica'}</Text></Pressable>)}</View>
      <Card style={styles.scoreHero}><View><Label>{mode === 'official' ? 'PUNTAJE OFICIAL' : 'PUNTAJE DE PRÁCTICA'}</Label><Text style={styles.scoreValue}>{score}</Text><Text style={styles.bodyMuted}>{complete ? 'Partida de 10 marcos terminada' : `Marco ${currentFrame?.number ?? 10} · tiro ${shotCount + 1}`}</Text></View><View style={styles.scoreHeroBadge}><Trophy size={20} color={C.amber} /><Text style={styles.scoreHeroBadgeText}>10{ '\n' }MARCOS</Text></View></Card>
      <View><View style={styles.headingRow}><Text style={styles.sectionTitle}>Tu partida</Text><Text style={styles.smallText}>Desliza para ver marcos</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.framesRow}>{frames.map((frame) => {
        const isCurrent = !complete && frame.number === currentFrame?.number;
        const cells = frame.number === 10 ? 3 : 2;
        return <View key={frame.number} style={[styles.frameCard, isCurrent && styles.frameCardActive]}><Text style={[styles.frameNumber, isCurrent && { color: C.amber }]}>{frame.number === 10 ? '10' : `0${frame.number}`}</Text><View style={styles.frameRolls}>{Array.from({ length: cells }, (_, index) => <Text key={index} style={styles.frameRoll}>{rollLabel(frame.rolls, index, frame.number)}</Text>)}</View><Text style={styles.frameTotal}>{frame.total ?? '·'}</Text></View>;
      })}</ScrollView></View>
      <Card style={styles.rollCard}><View style={styles.rollCardTop}><View><Label>REGISTRA TUS PINOS</Label><Text style={styles.cardTitle}>¿Cuántos derribaste?</Text></View><View style={styles.pinsBadge}><Target size={14} color={C.amber} /><Text style={styles.pinsBadgeText}>{standings} disponibles</Text></View></View><Text style={styles.bodyMuted}>{limit === null ? 'Partida terminada.' : limit === 10 ? 'Toca los pinos derribados en este tiro.' : `Quedan ${limit} pinos tras el primer lanzamiento.`}</Text>
        {!complete && <View style={styles.keypad}>{Array.from({ length: limit + 1 }, (_, value) => <Pressable key={value} onPress={() => onRoll(value)} style={({ pressed }) => [styles.key, value === 10 && styles.keyStrike, pressed && styles.pressed]}><Text style={[styles.keyText, value === 10 && { color: C.amber }]}>{value === 10 ? 'X' : value}</Text><Text style={styles.keyHint}>{value === 10 ? 'STRIKE' : value === 0 ? 'GUTTER' : `${value} pinos`}</Text></Pressable>)}</View>}
      </Card>
      {complete && <Card style={styles.resultCard}><View style={styles.challengeTop}><View style={styles.resultIcon}><Check size={18} color={C.bg} /></View><View style={styles.flex}><Label>BUEN TRABAJO</Label><Text style={styles.cardTitleLarge}>Anota un {score}</Text></View><Pill tone="mint">GUARDAR</Pill></View><Text style={styles.bodyMuted}>{mode === 'official' ? 'Esta partida se añadirá al historial y validará tus retos oficiales.' : 'La partida se añadirá al historial como práctica.'}</Text><ActionButton label="Guardar partida" icon={Check} onPress={onSave} style={{ marginTop: 14 }} /></Card>}
      <View style={styles.ruleHint}><ShieldCheck size={15} color={C.mint} /><Text style={styles.smallText}>Puntaje calculado con bonificaciones oficiales de strike y spare.</Text></View>
    </View>
  );
}

function ProfileScreen({ role, history, completedCount, onRoleChange, onLogOut }: { role: Role; history: MatchRecord[]; completedCount: number; onRoleChange: (role: Role) => void; onLogOut: () => void }) {
  const avg = history.length ? Math.round(history.reduce((sum, game) => sum + game.score, 0) / history.length) : 0;
  const roleLabel = role === 'player' ? 'Jugador' : role === 'coach' ? 'Entrenador' : 'Administrador';
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="amber">MI CUENTA</Pill><Text style={styles.pageTitle}>Perfil de atleta</Text></View>
      <Card style={styles.profileCard}><View style={styles.profileTop}><View style={styles.profileAvatar}>{role === 'admin' ? <Text style={styles.profileAvatarText}>BP</Text> : <Image source={role === 'coach' ? require('./assets/coach.png') : require('./assets/player.png')} style={styles.profilePhoto} />}</View><View style={styles.flex}><Text style={styles.profileName}>{role === 'coach' ? 'Carlos Méndez' : role === 'admin' ? 'Equipo BowlingPro' : 'Mateo Morales'}</Text><Text style={styles.bodyMuted}>{roleLabel} · Liga Metropolitana</Text></View><Pressable onPress={() => Alert.alert('Editar perfil', 'La edición de datos estará disponible al conectar el servicio de cuentas.')}><UserRound size={18} color={C.muted} /></Pressable></View><View style={styles.profileStats}><View><Text style={styles.profileStatValue}>{avg || '—'}</Text><Text style={styles.smallText}>PROMEDIO</Text></View><View><Text style={styles.profileStatValue}>{history.length}</Text><Text style={styles.smallText}>PARTIDAS</Text></View><View><Text style={styles.profileStatValue}>{completedCount}</Text><Text style={styles.smallText}>LECCIONES</Text></View></View></Card>
      <View><Heading title="Historial de partidas" /><Card style={{ paddingVertical: 2 }}>{history.map((game) => <View key={game.id} style={styles.historyRow}><View style={styles.historyIcon}><Trophy size={16} color={game.mode === 'official' ? C.amber : C.blue} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{game.date}</Text><Text style={styles.smallText}>{game.mode === 'official' ? 'Juego oficial' : 'Práctica'}</Text></View><Text style={styles.historyScore}>{game.score}</Text><ChevronRight size={16} color={C.dim} /></View>)}</Card></View>
      <View><Heading title="Cambiar modo de acceso" /><Text style={styles.bodyMuted}>Vista local de demostración para revisar los flujos por rol.</Text><View style={styles.roleCards}>{(['player', 'coach', 'admin'] as Role[]).map((item) => <Pressable key={item} onPress={() => onRoleChange(item)} style={[styles.roleCard, role === item && styles.roleCardActive]}><Text style={[styles.roleCardTitle, role === item && { color: C.amber }]}>{item === 'player' ? 'Jugador' : item === 'coach' ? 'Entrenador' : 'Admin'}</Text><Text style={styles.smallText}>{item === 'player' ? 'Aprendizaje y partidas' : item === 'coach' ? 'Grupo y planes' : 'Cuentas y contenido'}</Text></Pressable>)}</View></View>
      <Card><View style={styles.challengeTop}><Bell size={19} color={C.amber} /><View style={styles.flex}><Text style={styles.cardTitle}>Notificaciones</Text><Text style={styles.smallText}>Actividad, retos y feedback</Text></View><Pressable onPress={() => Alert.alert('Notificaciones', 'No tienes alertas nuevas. Tus próximas notificaciones aparecerán aquí.')}><ChevronRight size={18} color={C.dim} /></Pressable></View></Card>
      <ActionButton label="Cerrar sesión" icon={LogOut} variant="secondary" onPress={onLogOut} />
    </View>
  );
}

function CoachRoster({ onOpenFeedback, onOpenStudent }: { onOpenFeedback: (id: string) => void; onOpenStudent: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'Revisión'>('Todos');
  const visible = assignedPlayers.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'Todos' || person.needsReview));
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="amber">GRUPO ASIGNADO · RN-05</Pill><Text style={styles.pageTitle}>Tu equipo</Text><Text style={styles.bodyMuted}>Carlos Méndez · Grupo Élite Vallesur</Text></View>
      <View style={styles.coachMetrics}><View style={styles.coachMetric}><Text style={styles.coachMetricValue}>03</Text><Text style={styles.smallText}>JUGADORES</Text></View><View style={styles.coachMetric}><Text style={[styles.coachMetricValue, { color: C.amber }]}>02</Text><Text style={styles.smallText}>POR REVISAR</Text></View><View style={styles.coachMetric}><Text style={[styles.coachMetricValue, { color: C.mint }]}>01</Text><Text style={styles.smallText}>PLAN AL DÍA</Text></View></View>
      <View style={styles.searchBar}><Search size={17} color={C.dim} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar jugador asignado" placeholderTextColor={C.dim} style={styles.searchInput} /></View>
      <View style={styles.segmentRow}>{(['Todos', 'Revisión'] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.segment, filter === item && styles.segmentActive]}><Text style={[styles.segmentText, filter === item && styles.segmentTextActive]}>{item}</Text></Pressable>)}</View>
      <View style={styles.screenStackTight}>{visible.map((person) => <Card key={person.id} style={styles.athleteCard}><View style={styles.athleteTop}><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>{person.initials}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{person.name}</Text><Text style={styles.smallText}>{person.level} · {person.average} promedio</Text></View>{person.needsReview && <View style={styles.reviewDot} />}</View><View style={styles.athleteProgress}><Text style={styles.smallText}>Progreso formativo</Text><Text style={styles.athleteProgressValue}>{person.progress}%</Text></View><Meter progress={person.progress} color={person.needsReview ? C.amber : C.mint} /><View style={styles.athleteActions}><ActionButton label="Ver progreso" variant="secondary" onPress={() => onOpenStudent(person.id)} style={styles.smallButton} /><ActionButton label="Dar feedback" icon={MessageCircle} onPress={() => onOpenFeedback(person.id)} style={styles.smallButton} /></View></Card>)}</View>
      <View style={styles.ruleHint}><ShieldCheck size={15} color={C.mint} /><Text style={styles.smallText}>Solo se muestran jugadores de tu grupo asignado.</Text></View>
    </View>
  );
}

function StudentDetail({ student, history, onBack, onFeedback, onPlan }: { student: typeof assignedPlayers[number]; history: MatchRecord[]; onBack: () => void; onFeedback: () => void; onPlan: () => void }) {
  const sampleScores = student.id === 'mateo' ? history.slice(0, 5).map((game) => game.score) : student.id === 'lucia' ? [126, 138, 142, 147, 142] : [195, 201, 207, 212, 207];
  const games = student.id === 'mateo' ? history.slice(0, 5) : sampleScores.map((score, index) => ({ id: `${student.id}-${index}`, date: ['Hoy', 'Ayer', 'Lun', 'Dom', 'Vie'][index], score, mode: 'official' as const, rolls: [] }));
  const best = Math.max(student.average, ...sampleScores);
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver al equipo</Text></Pressable>
      <Card style={styles.profileCard}><View style={styles.profileTop}><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>{student.initials}</Text></View><View style={styles.flex}><Pill tone="amber">{student.level.toUpperCase()}</Pill><Text style={styles.profileName}>{student.name}</Text><Text style={styles.bodyMuted}>Grupo Élite Vallesur · Lanzador diestro</Text></View></View><View style={styles.profileStats}><View><Text style={styles.profileStatValue}>{student.average}</Text><Text style={styles.smallText}>PROMEDIO</Text></View><View><Text style={styles.profileStatValue}>{best}</Text><Text style={styles.smallText}>MEJOR JUEGO</Text></View><View><Text style={styles.profileStatValue}>{student.progress}%</Text><Text style={styles.smallText}>PROGRESO</Text></View></View></Card>
      <View><Heading title="Rendimiento" /><Card style={styles.chartCard}><View style={styles.chartTop}><View><Label>ÚLTIMAS 5 PARTIDAS</Label><Text style={styles.chartAverage}>{student.average} <Text style={styles.smallText}>promedio del grupo</Text></Text></View><View style={styles.trendBadge}><TrendingUp size={14} color={C.mint} /><Text style={styles.trendText}>estable</Text></View></View><View style={styles.barChart}>{sampleScores.map((score, index) => <View key={`${score}-${index}`} style={styles.barColumn}><Text style={styles.barValue}>{score}</Text><View style={[styles.chartBar, { height: `${Math.max(18, Math.round(score / 2.5))}%` }]} /><Text style={styles.barDate}>{index === 0 ? 'Hoy' : `P${index + 1}`}</Text></View>)}</View></Card></View>
      <View><Heading title="Historial reciente" /><Card style={{ paddingVertical: 2 }}>{games.map((game) => <View key={game.id} style={styles.historyRow}><View style={styles.historyIcon}><Trophy size={16} color={C.amber} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{game.date}</Text><Text style={styles.smallText}>Juego oficial</Text></View><Text style={styles.historyScore}>{game.score}</Text></View>)}</Card></View>
      <Card><View style={styles.challengeTop}><View style={styles.assessmentIcon}><Target size={19} color={C.amber} /></View><View style={styles.flex}><Label>FOCO TÉCNICO</Label><Text style={styles.cardTitle}>Conversión de spares</Text></View><Pill tone="amber">REVISAR</Pill></View><Text style={styles.bodyMuted}>Define el siguiente objetivo del alumno con base en su rendimiento reciente y sus partidas registradas.</Text></Card>
      <View style={styles.chapterControls}><ActionButton label="Asignar plan" icon={ClipboardList} variant="secondary" onPress={onPlan} style={styles.chapterControlButton} /><ActionButton label="Dar feedback" icon={MessageCircle} onPress={onFeedback} style={styles.chapterControlButton} /></View>
    </View>
  );
}

function CoachPlans({ plans, studentId, onSavePlan, onAssign }: { plans: TrainingPlan[]; studentId: string; onSavePlan: (plan: TrainingPlan) => void; onAssign: (plan: TrainingPlan) => void }) {
  const [activePlanId, setActivePlanId] = useState(plans[0]?.id ?? '');
  const [draftPlan, setDraftPlan] = useState<TrainingPlan | null>(null);
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? plans[0];
  const assignedStudent = (playerId: string) => assignedPlayers.find((player) => player.id === playerId)?.name ?? 'Sin asignar';
  const editPlan = (plan: TrainingPlan) => { setActivePlanId(plan.id); setDraftPlan({ ...plan }); };
  const newPlan = () => {
    const id = `plan-${Date.now()}`;
    setActivePlanId(id);
    setDraftPlan({ id, title: '', playerId: studentId, weeklySessions: 3, progress: 0, target: '' });
  };
  const savePlan = () => {
    if (!draftPlan?.title.trim() || !draftPlan.target.trim() || draftPlan.weeklySessions < 1) {
      Alert.alert('Completa el plan', 'Indica nombre, objetivo y al menos una sesión semanal.');
      return;
    }
    const saved = { ...draftPlan, title: draftPlan.title.trim(), target: draftPlan.target.trim() };
    onSavePlan(saved);
    setActivePlanId(saved.id);
    setDraftPlan(null);
  };
  return (
    <View style={styles.screenStack}>
      <View style={styles.plansTitleRow}><View><Pill tone="amber">RF-15 · RF-18</Pill><Text style={styles.pageTitle}>Planes</Text></View><Pressable accessibilityLabel="Crear plan" onPress={newPlan} style={styles.addButton}><Plus size={18} color="#FFFFFF" /></Pressable></View>
      {plans.map((plan) => <Card key={plan.id} style={[styles.planCard, activePlan?.id === plan.id && styles.planCardSelected]}><View style={styles.planTop}><View style={styles.flex}><Text style={styles.cardTitleLarge}>{plan.title}</Text><Text style={styles.smallText}>{assignedStudent(plan.playerId)} · {plan.weeklySessions} sesiones / semana</Text></View><Pressable accessibilityLabel={`Editar ${plan.title}`} onPress={() => editPlan(plan)} style={styles.editorAction}><Text style={styles.actionText}>Editar</Text></Pressable></View><View style={styles.planTarget}><Target size={15} color={C.amber} /><Text style={styles.planTargetText}>{plan.target}</Text></View><View style={styles.athleteProgress}><Text style={styles.smallText}>Cumplimiento semanal</Text><Text style={styles.athleteProgressValue}>{plan.progress}%</Text></View><Meter progress={plan.progress} color={activePlan?.id === plan.id ? C.amber : C.blue} /></Card>)}
      {draftPlan && <Card style={styles.planEditor}><View style={styles.headingRow}><Text style={styles.sectionTitle}>{plans.some((plan) => plan.id === draftPlan.id) ? 'Editar plan' : 'Nuevo plan'}</Text><Pressable accessibilityLabel="Cancelar edición" onPress={() => setDraftPlan(null)}><X size={18} color={C.muted} /></Pressable></View><Label>NOMBRE DEL PLAN</Label><TextInput value={draftPlan.title} onChangeText={(value) => setDraftPlan((current) => current ? { ...current, title: value } : current)} placeholder="Ej. Conversión y precisión" placeholderTextColor={C.dim} style={styles.input} /><Label>OBJETIVO TÉCNICO</Label><TextInput value={draftPlan.target} onChangeText={(value) => setDraftPlan((current) => current ? { ...current, target: value } : current)} placeholder="Objetivo medible del jugador" placeholderTextColor={C.dim} style={styles.input} /><Label>SESIONES POR SEMANA</Label><TextInput value={String(draftPlan.weeklySessions)} onChangeText={(value) => setDraftPlan((current) => current ? { ...current, weeklySessions: Number(value.replace(/\D/g, '')) } : current)} keyboardType="number-pad" placeholder="3" placeholderTextColor={C.dim} style={styles.input} /><ActionButton label="Guardar cambios" icon={Check} onPress={savePlan} /></Card>}
      <Card><Heading title="Banco de ejercicios" /><View style={styles.bankRow}><Target size={17} color={C.blue} /><View style={styles.flex}><Text style={styles.cardTitle}>Tiros a la flecha 2</Text><Text style={styles.smallText}>Precisión · 3 series de 5 tiros</Text></View><Plus size={17} color={C.muted} /></View><View style={styles.bankRow}><Activity size={17} color={C.mint} /><View style={styles.flex}><Text style={styles.cardTitle}>Suelta sin tensión</Text><Text style={styles.smallText}>Técnica · 12 lanzamientos</Text></View><Plus size={17} color={C.muted} /></View></Card>
      {activePlan && <ActionButton label={`Asignar a ${assignedStudent(studentId)}`} icon={Check} onPress={() => onAssign(activePlan)} />}
    </View>
  );
}

function CoachFeedback({ feedback, studentName, onSend }: { feedback: FeedbackRecord[]; studentName: string; onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');
  const send = () => {
    if (!message.trim()) {
      Alert.alert('Escribe un comentario', 'Añade una observación breve antes de enviarla.');
      return;
    }
    onSend(message.trim());
    setMessage('');
    Alert.alert('Feedback guardado', `El comentario quedó asociado a ${studentName}, jugador de tu grupo.`);
  };
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="amber">SEGUIMIENTO · GRUPO ÉLITE</Pill><Text style={styles.pageTitle}>Feedback</Text><Text style={styles.bodyMuted}>Comentarios vinculados al progreso del jugador.</Text></View>
      <Card><View style={styles.challengeTop}><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>{studentName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{studentName}</Text><Text style={styles.smallText}>Nota vinculada al progreso del alumno</Text></View><Pill tone="amber">SEGUIMIENTO</Pill></View><Label style={{ marginTop: 16 }}>OBSERVACIÓN DEL ENTRENADOR</Label><TextInput multiline value={message} onChangeText={setMessage} placeholder="Anota una recomendación técnica..." placeholderTextColor={C.dim} style={[styles.input, styles.messageInput]} /><ActionButton label="Enviar feedback" icon={ArrowRight} onPress={send} style={{ marginTop: 12 }} /></Card>
      <View><Heading title="Comentarios recientes" />{feedback.length === 0 ? <Card><Text style={styles.bodyMuted}>Aún no hay comentarios guardados. Tu feedback aparecerá aquí.</Text></Card> : feedback.map((entry) => <Card key={entry.id} style={styles.feedbackCard}><View style={styles.feedbackTop}><Text style={styles.cardTitle}>{entry.player}</Text><Text style={styles.smallText}>{entry.date}</Text></View><Text style={styles.bodyMuted}>{entry.message}</Text></Card>)}</View>
      <View style={styles.ruleHint}><ShieldCheck size={15} color={C.mint} /><Text style={styles.smallText}>El acceso del entrenador se limita a jugadores asignados (RN-05).</Text></View>
    </View>
  );
}

function AdminContent({ modules, onToggle, onEdit, onEditAssessment, onCreate }: { modules: LearningModule[]; onToggle: (id: string) => void; onEdit: (id: string) => void; onEditAssessment: () => void; onCreate: () => void }) {
  return (
    <View style={styles.screenStack}>
      <View style={styles.adminPageHeading}><View style={styles.flex}><Pill tone="amber">ADMINISTRACIÓN · RN-06</Pill><Text style={styles.pageTitle}>Contenido</Text><Text style={styles.bodyMuted}>Edita módulos, lecciones y evaluaciones antes de publicarlos.</Text></View><ActionButton label="Nuevo" icon={Plus} onPress={onCreate} style={styles.createModuleButton} /></View>
      <Card style={styles.adminMetricCard}><View style={styles.adminMetric}><Text style={styles.adminMetricValue}>{modules.length}</Text><Text style={styles.smallText}>MÓDULOS</Text></View><View style={styles.adminMetric}><Text style={[styles.adminMetricValue, { color: C.mint }]}>{modules.filter((module) => module.published).length}</Text><Text style={styles.smallText}>PUBLICADOS</Text></View><View style={styles.adminMetric}><Text style={[styles.adminMetricValue, { color: C.amber }]}>{modules.filter((module) => !module.published).length}</Text><Text style={styles.smallText}>BORRADORES</Text></View></Card>
      {modules.map((module) => <Card key={module.id} style={styles.adminRow}><View style={styles.challengeTop}><View style={styles.adminModuleIcon}><BookOpen size={18} color={C.blue} /></View><View style={styles.flex}><Text style={styles.cardTitle}>{module.title}</Text><Text style={styles.smallText}>{module.level} · {module.lessons.length} lecciones</Text></View><Pressable onPress={() => onEdit(module.id)} style={styles.editorAction}><Text style={styles.actionText}>Editar</Text><ChevronRight size={15} color={C.amber} /></Pressable></View><Text style={styles.bodyMuted}>{module.description}</Text><View style={styles.athleteProgress}><Text style={styles.smallText}>Estado del módulo</Text><View style={styles.publishStatus}><Pill tone={module.published ? 'mint' : 'neutral'}>{module.published ? 'PUBLICADO' : 'BORRADOR'}</Pill><Pressable accessibilityLabel={module.published ? `Retirar ${module.title}` : `Publicar ${module.title}`} onPress={() => onToggle(module.id)} style={[styles.publishToggle, module.published && styles.publishToggleOn]}><View style={[styles.publishKnob, module.published && styles.publishKnobOn]} /></Pressable></View></View></Card>)}
      <Card><View style={styles.challengeTop}><View style={styles.assessmentIcon}><Medal size={19} color={C.amber} /></View><View style={styles.flex}><Label>EVALUACIÓN · AVANCE DE NIVEL</Label><Text style={styles.cardTitle}>Banco de preguntas</Text><Text style={styles.smallText}>Umbral de aprobación: 80%</Text></View><Pressable onPress={onEditAssessment} style={styles.editorAction}><Text style={styles.actionText}>Editar</Text><ChevronRight size={15} color={C.amber} /></Pressable></View></Card>
      <Card><View style={styles.challengeTop}><ShieldCheck size={19} color={C.amber} /><Text style={[styles.cardTitle, styles.flex]}>Permisos editoriales</Text></View><Text style={styles.bodyMuted}>Solo administradores pueden crear, modificar o retirar contenido de aprendizaje (RN-06).</Text></Card>
    </View>
  );
}

function ContentModuleEditor({ module, onBack, onSave }: { module: LearningModule; onBack: () => void; onSave: (module: LearningModule) => void }) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description);
  const [level, setLevel] = useState(module.level);
  const [lessonsText, setLessonsText] = useState(module.lessons.join('\n'));
  const save = () => {
    const lessons = lessonsText.split('\n').map((lesson) => lesson.trim()).filter(Boolean);
    if (!title.trim() || !description.trim() || lessons.length === 0) {
      Alert.alert('Completa el contenido', 'Cada módulo debe tener título, descripción y al menos una lección.');
      return;
    }
    onSave({ ...module, title: title.trim(), description: description.trim(), level, lessons });
    Alert.alert('Módulo guardado', 'Los cambios se guardaron en este dispositivo.');
  };
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver al contenido</Text></Pressable>
      <View><Pill tone="amber">EDITOR DE CONTENIDO · ADMIN</Pill><Text style={styles.pageTitle}>Editar módulo</Text><Text style={styles.bodyMuted}>{module.level} · cambios locales de demostración</Text></View>
      <Card><Label>TÍTULO DEL MÓDULO</Label><TextInput value={title} onChangeText={setTitle} placeholder="Nombre del módulo" placeholderTextColor={C.dim} style={styles.input} /><Label style={{ marginTop: 5 }}>NIVEL FORMATIVO</Label><View style={styles.segmentRow}>{(['Principiante', 'Intermedio', 'Avanzado'] as const).map((item) => <Pressable key={item} onPress={() => setLevel(item)} style={[styles.segment, level === item && styles.segmentActive]}><Text style={[styles.segmentText, level === item && styles.segmentTextActive]}>{item}</Text></Pressable>)}</View><Label style={{ marginTop: 5 }}>DESCRIPCIÓN</Label><TextInput multiline value={description} onChangeText={setDescription} placeholder="Objetivo formativo" placeholderTextColor={C.dim} style={[styles.input, styles.editorDescription]} /></Card>
      <Card><View style={styles.headingRow}><Text style={styles.sectionTitle}>Lecciones</Text><Pill tone="neutral">UNA POR LÍNEA</Pill></View><Text style={styles.bodyMuted}>Edita el título de cada lección. El contenido detallado se organiza dentro de su visor.</Text><TextInput multiline value={lessonsText} onChangeText={setLessonsText} placeholder="Título de la lección" placeholderTextColor={C.dim} style={[styles.input, styles.editorLessons]} /></Card>
      <View style={styles.chapterControls}><ActionButton label="Cancelar" variant="secondary" onPress={onBack} style={styles.chapterControlButton} /><ActionButton label="Guardar módulo" icon={Check} onPress={save} style={styles.chapterControlButton} /></View>
    </View>
  );
}

function AssessmentEditor({ questions, onBack, onSave }: { questions: AssessmentQuestion[]; onBack: () => void; onSave: (questions: AssessmentQuestion[]) => void }) {
  const [draft, setDraft] = useState(() => questions.map((question) => ({ ...question, choices: [...question.choices] })));
  const updateQuestion = (questionIndex: number, update: Partial<AssessmentQuestion>) => setDraft((current) => current.map((question, index) => index === questionIndex ? { ...question, ...update } : question));
  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => setDraft((current) => current.map((question, index) => index === questionIndex ? { ...question, choices: question.choices.map((choice, item) => item === choiceIndex ? value : choice) } : question));
  const save = () => {
    const valid = draft.length >= 5 && draft.every((question) => question.question.trim() && question.choices.length >= 2 && question.choices.every((choice) => choice.trim()) && question.correct >= 0 && question.correct < question.choices.length);
    if (!valid) {
      Alert.alert('Evaluación incompleta', 'Usa al menos cinco preguntas y verifica que cada una tenga dos opciones y una respuesta correcta.');
      return;
    }
    onSave(draft.map((question) => ({ ...question, question: question.question.trim(), choices: question.choices.map((choice) => choice.trim()) })));
    Alert.alert('Evaluación guardada', 'La academia ya usará las preguntas y respuestas actualizadas.');
  };
  return (
    <View style={styles.screenStack}>
      <Pressable onPress={onBack} style={styles.backLink}><Text style={styles.actionText}>‹  Volver al contenido</Text></Pressable>
      <View><Pill tone="amber">EDITOR DE EVALUACIÓN · ADMIN</Pill><Text style={styles.pageTitle}>Banco de preguntas</Text><Text style={styles.bodyMuted}>La nota se calcula con las respuestas correctas. Se requiere 80% para avanzar.</Text></View>
      {draft.map((question, questionIndex) => <Card key={`question-${questionIndex}`} style={styles.questionEditor}><View style={styles.questionEditorHeader}><Text style={styles.questionNumber}>P{String(questionIndex + 1).padStart(2, '0')}</Text><Text style={styles.smallText}>Marca la opción correcta</Text><Pressable accessibilityLabel={`Eliminar pregunta ${questionIndex + 1}`} disabled={draft.length <= 5} onPress={() => setDraft((current) => current.filter((_, index) => index !== questionIndex))} style={styles.deleteQuestion}><X size={16} color={draft.length <= 5 ? C.dim : C.red} /></Pressable></View><TextInput multiline value={question.question} onChangeText={(value) => updateQuestion(questionIndex, { question: value })} placeholder="Pregunta" placeholderTextColor={C.dim} style={[styles.input, styles.questionInput]} />{question.choices.map((choice, choiceIndex) => <View key={`choice-${choiceIndex}`} style={styles.choiceEditorRow}><Pressable accessibilityLabel={`Marcar opción ${choiceIndex + 1} correcta`} onPress={() => updateQuestion(questionIndex, { correct: choiceIndex })} style={[styles.correctChoice, question.correct === choiceIndex && styles.correctChoiceActive]}>{question.correct === choiceIndex && <Check size={12} color={C.bg} />}</Pressable><TextInput value={choice} onChangeText={(value) => updateChoice(questionIndex, choiceIndex, value)} placeholder={`Opción ${choiceIndex + 1}`} placeholderTextColor={C.dim} style={[styles.input, styles.choiceInput]} /></View>)}<Pressable onPress={() => setDraft((current) => current.map((item, index) => index === questionIndex ? { ...item, choices: [...item.choices, ''] } : item))} style={styles.addChoice}><Plus size={14} color={C.amber} /><Text style={styles.actionText}>Añadir opción</Text></Pressable></Card>)}
      <ActionButton label="Añadir pregunta" icon={Plus} variant="secondary" onPress={() => setDraft((current) => [...current, { question: '', choices: ['', ''], correct: 0 }])} />
      <ActionButton label="Guardar evaluación" icon={Check} onPress={save} />
    </View>
  );
}

function AdminAccounts({ enabled, onToggle }: { enabled: boolean[]; onToggle: (index: number) => void }) {
  const accounts = [
    { name: 'Mateo Morales', email: 'mateo@bowlingpro.app', role: 'Jugador' },
    { name: 'Carlos Méndez', email: 'carlos@bowlingpro.app', role: 'Entrenador' },
    { name: 'Lucía Herrera', email: 'lucia@bowlingpro.app', role: 'Jugador' },
  ];
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="amber">GESTIÓN DE CUENTAS · RF-28</Pill><Text style={styles.pageTitle}>Cuentas</Text><Text style={styles.bodyMuted}>Revisa el estado de los perfiles registrados.</Text></View>
      <View style={styles.searchBar}><Search size={17} color={C.dim} /><TextInput placeholder="Buscar cuenta" placeholderTextColor={C.dim} style={styles.searchInput} /></View>
      {accounts.map((account, index) => <Card key={account.email} style={styles.accountRow}><View style={styles.coachInitials}><Text style={styles.coachInitialsText}>{account.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{account.name}</Text><Text style={styles.smallText}>{account.email} · {account.role}</Text></View><Pressable onPress={() => onToggle(index)} style={[styles.accountStatus, enabled[index] && styles.accountStatusOn]}><Text style={[styles.accountStatusText, enabled[index] && { color: C.mint }]}>{enabled[index] ? 'Activa' : 'Pausada'}</Text></Pressable></Card>)}
      <Card><Text style={styles.bodyMuted}>Los cambios de estado se simulan en esta vista local. La gestión real requiere un servicio de autenticación y permisos del servidor.</Text></Card>
    </View>
  );
}

function AdminAudit() {
  const events = [
    { time: 'Hoy · 10:42', text: 'Lección “Suelta y seguimiento” actualizada', actor: 'Administración', icon: BookOpen },
    { time: 'Hoy · 09:15', text: 'Plan semanal asignado a Mateo Morales', actor: 'Carlos Méndez', icon: ClipboardList },
    { time: 'Ayer · 17:30', text: 'Partida oficial registrada · 198 puntos', actor: 'Mateo Morales', icon: Trophy },
    { time: 'Ayer · 15:02', text: 'Inicio de sesión correcto', actor: 'Lucía Herrera', icon: ShieldCheck },
  ];
  return (
    <View style={styles.screenStack}>
      <View><Pill tone="mint">REGISTRO DEL SISTEMA</Pill><Text style={styles.pageTitle}>Auditoría</Text><Text style={styles.bodyMuted}>Actividad reciente de BowlingPro.</Text></View>
      <View style={styles.auditRail}>{events.map((event, index) => {
        const Glyph = event.icon;
        return <View key={event.time} style={styles.auditEvent}><View style={styles.auditTimeline}><View style={styles.auditDot}><Glyph size={15} color={index === 0 ? C.amber : C.blue} /></View>{index < events.length - 1 && <View style={styles.auditLine} />}</View><View style={styles.auditBody}><Text style={styles.smallText}>{event.time}</Text><Text style={styles.cardTitle}>{event.text}</Text><Text style={styles.bodyMuted}>{event.actor}</Text></View></View>;
      })}</View>
      <Card><View style={styles.challengeTop}><ShieldCheck size={18} color={C.mint} /><Text style={[styles.cardTitle, styles.flex]}>Registro de solo lectura</Text></View><Text style={styles.bodyMuted}>En producción, este historial debe conservar actor, fecha, acción y recurso para cada cambio relevante.</Text></Card>
    </View>
  );
}

export default function App() {
  const router = useRouter();
  const route = useLocalSearchParams<{ role?: string; tab?: string; flow?: string }>();
  const [outfitLoaded] = useOutfit({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold });
  const [jakartaLoaded] = useJakarta({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold });
  const [hydrated, setHydrated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [role, setRole] = useState<Role>('player');
  const [tab, setTab] = useState<Tab>('home');
  const [history, setHistory] = useState<MatchRecord[]>(seedMatches);
  const [rolls, setRolls] = useState<number[]>([]);
  const [matchMode, setMatchMode] = useState<'official' | 'practice'>('official');
  const [completedLessons, setCompletedLessons] = useState<string[]>(SEED_COMPLETED_LESSONS);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(featuredLesson);
  const [completedDrills, setCompletedDrills] = useState<string[]>(['line']);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [modules, setModules] = useState<LearningModule[]>(INITIAL_MODULES);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>(INITIAL_ASSESSMENT);
  const [plans, setPlans] = useState<TrainingPlan[]>(INITIAL_PLANS);
  const [enabledAccounts, setEnabledAccounts] = useState([true, true, true]);
  const [selectedStudentId, setSelectedStudentId] = useState('mateo');
  const [selectedModuleId, setSelectedModuleId] = useState(INITIAL_MODULES[0].id);
  const routeTabs: Tab[] = ['home', 'learn', 'train', 'match', 'profile', 'roster', 'plans', 'feedback', 'content', 'accounts', 'audit', 'leaderboard', 'notifications', 'lesson', 'student', 'content-editor', 'assessment-editor'];
  const activeRole: Role = route.role === 'coach' || route.role === 'admin' || route.role === 'player' ? route.role : role;
  const activeTab = route.tab && routeTabs.includes(route.tab as Tab) ? route.tab as Tab : tab;
  const isRegistering = route.flow === 'register' || registering;

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then((stored) => {
      if (!stored) return;
      const data = JSON.parse(stored) as Partial<{ authenticated: boolean; role: Role; history: MatchRecord[]; completedLessons: string[]; assessmentScore: number | null; completedDrills: string[]; feedback: FeedbackRecord[]; modules: LearningModule[]; assessmentQuestions: AssessmentQuestion[]; plans: TrainingPlan[]; published: boolean[]; enabledAccounts: boolean[] }>;
      if (data.authenticated !== undefined) setAuthenticated(data.authenticated);
      if (data.role) { setRole(data.role); setTab(roleStartTab[data.role]); }
      if (data.history) setHistory(data.history);
      if (data.completedLessons) setCompletedLessons(data.completedLessons.map((id) => id.includes(':') ? id : `technique:${id}`));
      if (data.assessmentScore !== undefined) setAssessmentScore(data.assessmentScore);
      if (data.completedDrills) setCompletedDrills(data.completedDrills);
      if (data.feedback) setFeedback(data.feedback);
      if (data.modules) setModules(data.modules);
      else if (data.published) setModules(INITIAL_MODULES.map((module, index) => ({ ...module, published: data.published?.[index] ?? module.published })));
      if (data.assessmentQuestions) setAssessmentQuestions(data.assessmentQuestions);
      if (data.plans) setPlans(data.plans);
      if (data.enabledAccounts) setEnabledAccounts(data.enabledAccounts);
    }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({ authenticated, role: activeRole, history, completedLessons, assessmentScore, completedDrills, feedback, modules, assessmentQuestions, plans, enabledAccounts })).catch(() => undefined);
  }, [hydrated, authenticated, activeRole, history, completedLessons, assessmentScore, completedDrills, feedback, modules, assessmentQuestions, plans, enabledAccounts]);

  const navigateTab = (nextTab: Tab) => {
    setTab(nextTab);
    router.setParams({ tab: nextTab });
  };
  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    setTab(roleStartTab[nextRole]);
    router.setParams({ role: nextRole, tab: roleStartTab[nextRole], flow: undefined });
  };
  const enter = (nextRole: Role) => { changeRole(nextRole); setAuthenticated(true); setRegistering(false); router.replace({ pathname: '/', params: { role: nextRole, tab: roleStartTab[nextRole] } }); };
  const openRegister = () => { setRegistering(true); router.setParams({ flow: 'register' }); };
  const closeRegister = () => { setRegistering(false); router.setParams({ flow: undefined }); };
  const officialChallenge = Math.max(0, ...history.filter((game) => game.mode === 'official').map((game) => bestStrikeRun(game.rolls)));
  const addRoll = (pins: number) => {
    setRolls((current) => {
      const limit = nextRollLimit(current);
      return limit === null || pins > limit ? current : [...current, pins];
    });
  };
  const saveMatch = () => {
    const newMatch: MatchRecord = { id: `match-${Date.now()}`, date: 'Hoy', score: scoreGame(rolls), mode: matchMode, rolls: [...rolls] };
    setHistory((current) => [newMatch, ...current]);
    setRolls([]);
    Alert.alert('Partida guardada', `${newMatch.score} puntos añadidos a tu historial.`);
  };
  const toggleLesson = (id: string) => setCompletedLessons((current) => current.includes(id) ? current : [...current, id]);
  const toggleDrill = (id: string) => setCompletedDrills((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const sendFeedback = (message: string, playerId: string) => {
    const player = assignedPlayers.find((item) => item.id === playerId);
    setFeedback((current) => [{ id: `feedback-${Date.now()}`, player: player?.name ?? 'Jugador asignado', message, date: 'Ahora' }, ...current]);
  };
  const tabs = appTabs[activeRole];

  if (!outfitLoaded || !jakartaLoaded || !hydrated) {
    return <SafeAreaView style={styles.loading}><StatusBar style="light" /><Text style={styles.brandName}>BowlingPro</Text><Text style={styles.smallText}>Preparando tu pista...</Text></SafeAreaView>;
  }

  if (!authenticated) {
    return <SafeAreaView style={styles.root}><StatusBar style="light" />{isRegistering ? <RegisterScreen onBack={closeRegister} onRegistered={enter} /> : <LoginScreen onEnter={enter} onRegister={openRegister} />}</SafeAreaView>;
  }

  const renderScreen = () => {
    if (activeTab === 'notifications') return <NotificationsScreen role={activeRole} onBack={() => navigateTab(roleStartTab[activeRole])} />;
    if (activeRole === 'player') {
      if (activeTab === 'leaderboard') return <LeaderboardScreen onBack={() => navigateTab('home')} />;
      if (activeTab === 'lesson') return <LessonViewer key={selectedLesson.id} completed={completedLessons} lesson={selectedLesson} onComplete={() => toggleLesson(selectedLesson.id)} onBack={() => navigateTab('learn')} />;
      if (activeTab === 'learn') return <AcademyScreen completed={completedLessons} assessmentScore={assessmentScore} questions={assessmentQuestions} modules={modules} onAssess={setAssessmentScore} onOpenLesson={(lesson) => { setSelectedLesson(lesson); navigateTab('lesson'); }} />;
      if (activeTab === 'train') return <TrainingScreen completed={completedDrills} onToggle={toggleDrill} />;
      if (activeTab === 'match') return <MatchScreen rolls={rolls} mode={matchMode} onModeChange={setMatchMode} onRoll={addRoll} onUndo={() => setRolls((current) => current.slice(0, -1))} onSave={saveMatch} />;
      if (activeTab === 'profile') return <ProfileScreen role={activeRole} history={history} completedCount={completedLessons.length} onRoleChange={changeRole} onLogOut={() => setAuthenticated(false)} />;
      return <PlayerHome history={history} lessonCount={completedLessons} assessmentScore={assessmentScore} challengeProgress={officialChallenge} modules={modules} onStartMatch={() => { setRolls([]); navigateTab('match'); }} onNavigate={navigateTab} />;
    }
    if (activeRole === 'coach') {
      if (activeTab === 'student') {
        const student = assignedPlayers.find((item) => item.id === selectedStudentId) ?? assignedPlayers[0];
        return <StudentDetail student={student} history={history} onBack={() => navigateTab('roster')} onFeedback={() => navigateTab('feedback')} onPlan={() => navigateTab('plans')} />;
      }
      if (activeTab === 'plans') return <CoachPlans plans={plans} studentId={selectedStudentId} onSavePlan={(plan) => setPlans((current) => current.some((item) => item.id === plan.id) ? current.map((item) => item.id === plan.id ? plan : item) : [...current, plan])} onAssign={(plan) => { setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, playerId: selectedStudentId } : item)); Alert.alert('Plan asignado', `${plan.title} · ${assignedPlayers.find((item) => item.id === selectedStudentId)?.name ?? 'Jugador asignado'}.`); }} />;
      if (activeTab === 'feedback') {
        const student = assignedPlayers.find((item) => item.id === selectedStudentId) ?? assignedPlayers[0];
        return <CoachFeedback feedback={feedback} studentName={student.name} onSend={(message) => sendFeedback(message, student.id)} />;
      }
      if (activeTab === 'profile') return <ProfileScreen role={activeRole} history={history} completedCount={completedLessons.length} onRoleChange={changeRole} onLogOut={() => setAuthenticated(false)} />;
      return <CoachRoster onOpenFeedback={(id) => { setSelectedStudentId(id); navigateTab('feedback'); }} onOpenStudent={(id) => { setSelectedStudentId(id); navigateTab('student'); }} />;
    }
    if (activeTab === 'accounts') return <AdminAccounts enabled={enabledAccounts} onToggle={(index) => setEnabledAccounts((current) => current.map((active, item) => item === index ? !active : active))} />;
    if (activeTab === 'audit') return <AdminAudit />;
    if (activeTab === 'profile') return <ProfileScreen role={activeRole} history={history} completedCount={completedLessons.length} onRoleChange={changeRole} onLogOut={() => setAuthenticated(false)} />;
    if (activeTab === 'content-editor') {
      const module = modules.find((item) => item.id === selectedModuleId) ?? modules[0];
      return <ContentModuleEditor key={module.id} module={module} onBack={() => navigateTab('content')} onSave={(updated) => { setModules((current) => current.map((item) => item.id === updated.id ? updated : item)); navigateTab('content'); }} />;
    }
    if (activeTab === 'assessment-editor') return <AssessmentEditor questions={assessmentQuestions} onBack={() => navigateTab('content')} onSave={(questions) => { setAssessmentQuestions(questions); navigateTab('content'); }} />;
    return <AdminContent modules={modules} onToggle={(id) => setModules((current) => current.map((module) => module.id === id ? { ...module, published: !module.published } : module))} onEdit={(id) => { setSelectedModuleId(id); navigateTab('content-editor'); }} onEditAssessment={() => navigateTab('assessment-editor')} onCreate={() => { const id = `module-${Date.now()}`; setModules((current) => [...current, { id, title: 'Nuevo módulo', level: 'Intermedio', description: 'Describe el objetivo de aprendizaje.', lessons: ['Nueva lección'], published: false }]); setSelectedModuleId(id); navigateTab('content-editor'); }} />;
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <Header role={activeRole} onProfile={() => navigateTab('profile')} onNotifications={() => navigateTab('notifications')} />
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{renderScreen()}</ScrollView>
      <View style={styles.tabBar}>{tabs.map((item) => {
        const active = activeTab === item.key;
        const Glyph = item.icon;
        return <Pressable key={item.key} onPress={() => navigateTab(item.key)} style={styles.tabItem}><View style={[styles.tabIcon, active && styles.tabIconActive]}><Glyph size={19} color={active ? C.amber : C.dim} strokeWidth={active ? 2.2 : 1.8} /></View><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text></Pressable>;
      })}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  header: { height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line, backgroundColor: C.bg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 35, height: 35, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  brandMarkText: { fontFamily: 'Outfit_800ExtraBold', fontSize: 24, color: '#FFFFFF', lineHeight: 28 },
  brandDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: C.amber, right: 4, top: 5 },
  brandName: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 18, lineHeight: 22 },
  brandCaption: { color: C.amber, fontFamily: 'Outfit_600SemiBold', fontSize: 9, lineHeight: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel, position: 'relative' },
  notificationDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, top: 7, right: 8, backgroundColor: C.amber, borderWidth: 1, borderColor: C.panel },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3856A8' },
  headerAvatarImage: { width: 34, height: 34, borderRadius: 17 },
  avatarInitials: { color: '#CFDAFF', fontFamily: 'Outfit_700Bold', fontSize: 10 },
  mainScroll: { flex: 1 },
  mainContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 },
  screenStack: { gap: 17 },
  screenStackTight: { gap: 12 },
  tabBar: { minHeight: 66, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line, backgroundColor: C.panel, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 7, paddingBottom: 6 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIcon: { width: 34, height: 29, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: C.amberSoft },
  tabLabel: { color: C.dim, fontFamily: 'Outfit_500Medium', fontSize: 10 },
  tabLabelActive: { color: C.amber, fontFamily: 'Outfit_700Bold' },
  card: { borderRadius: 17, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, padding: 15, gap: 10 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 17, lineHeight: 22 },
  actionText: { color: C.amber, fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  label: { color: C.dim, fontFamily: 'Outfit_700Bold', fontSize: 9, letterSpacing: 0.6, lineHeight: 13 },
  bodyMuted: { color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 18 },
  smallText: { color: C.dim, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15 },
  cardTitle: { color: C.text, fontFamily: 'Outfit_600SemiBold', fontSize: 14, lineHeight: 19 },
  cardTitleLarge: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 17, lineHeight: 22 },
  pageTitle: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 27, lineHeight: 33, marginTop: 7 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: C.blueSoft },
  pillAmber: { backgroundColor: C.amberSoft },
  pillMint: { backgroundColor: C.mintSoft },
  pillNeutral: { backgroundColor: C.panel3 },
  pillText: { color: '#AFC2FF', fontFamily: 'Outfit_700Bold', fontSize: 9, letterSpacing: 0.35 },
  button: { minHeight: 47, borderRadius: 13, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.blue },
  buttonSecondary: { backgroundColor: C.panel3, borderWidth: 1, borderColor: C.line },
  buttonQuiet: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.line },
  buttonAmber: { backgroundColor: C.amber },
  buttonDisabled: { backgroundColor: C.panel3, borderColor: C.line, opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontFamily: 'Outfit_700Bold', fontSize: 13 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  meterTrack: { height: 5, overflow: 'hidden', borderRadius: 6, backgroundColor: C.panel3 },
  meterFill: { height: '100%', borderRadius: 6 },
  statGrid: { flexDirection: 'row', gap: 10 },
  statTile: { flex: 1, padding: 13, minHeight: 111, borderWidth: 1, borderColor: C.line, borderRadius: 15, backgroundColor: C.panel },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statValue: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 28, lineHeight: 34, marginTop: 10, fontVariant: ['tabular-nums'] },
  statNote: { color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, lineHeight: 14, marginTop: 2 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 27, lineHeight: 34, marginTop: 3 },
  streak: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: C.amberSoft },
  streakText: { color: C.amber, fontFamily: 'Outfit_700Bold', fontSize: 11 },
  levelCard: { backgroundColor: C.panel2, padding: 16 },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelName: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 22, marginTop: 3 },
  levelTrack: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 6 },
  levelStepDone: { width: 19, height: 19, borderRadius: 10, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  levelStepLocked: { width: 19, height: 19, borderRadius: 10, backgroundColor: C.panel3, alignItems: 'center', justifyContent: 'center' },
  levelBar: { flex: 1 },
  levelLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  levelNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderRadius: 11, padding: 10, marginTop: 10 },
  levelNoteText: { flex: 1, color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 15 },
  matchHero: { backgroundColor: '#182542', borderColor: '#344B7A', padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  matchTitle: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 22, lineHeight: 29, marginTop: 10 },
  modePreview: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(11,19,38,0.55)' },
  monoSmall: { color: C.dim, fontFamily: 'Outfit_600SemiBold', fontSize: 9 },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  challengeIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  challengeBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  leaderboardLink: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel },
  leaderboardIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  leaderboardHero: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#182542', borderColor: '#344B7A' },
  leaderboardRank: { color: C.amber, fontFamily: 'Outfit_800ExtraBold', fontSize: 38, lineHeight: 44 },
  leaderboardRankTail: { color: C.muted, fontFamily: 'Outfit_500Medium', fontSize: 12 },
  rankingList: { gap: 8 },
  rankingRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11 },
  rankingRowYou: { borderColor: C.amber, backgroundColor: C.panel2 },
  rankNumber: { width: 22, color: C.dim, fontFamily: 'Outfit_800ExtraBold', fontSize: 13 },
  rankingAverage: { alignItems: 'flex-end' },
  rankingScore: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 18, fontVariant: ['tabular-nums'] },
  notificationsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  notificationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 12 },
  notificationRead: { opacity: 0.62 },
  notificationIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  notificationAmber: { backgroundColor: C.amberSoft },
  notificationMint: { backgroundColor: C.mintSoft },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  strikeTokens: { flexDirection: 'row', gap: 7 },
  strikeToken: { width: 29, height: 29, borderRadius: 9, backgroundColor: C.panel3, alignItems: 'center', justifyContent: 'center' },
  strikeTokenDone: { backgroundColor: C.amber },
  strikeTokenText: { color: C.dim, fontFamily: 'Outfit_800ExtraBold', fontSize: 14 },
  challengeCount: { color: C.amber, fontFamily: 'Outfit_700Bold', fontSize: 13 },
  chartCard: { paddingBottom: 12 },
  chartTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartAverage: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 22, marginTop: 3 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.mintSoft, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 },
  trendText: { color: C.mint, fontFamily: 'Outfit_600SemiBold', fontSize: 9 },
  barChart: { height: 115, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: C.line, paddingTop: 10 },
  barColumn: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
  barValue: { color: C.muted, fontFamily: 'Outfit_500Medium', fontSize: 9 },
  chartBar: { width: 18, minHeight: 14, maxHeight: 75, backgroundColor: C.blue, borderRadius: 6 },
  barDate: { color: C.dim, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 8, marginBottom: -17 },
  lessonPrompt: { flexDirection: 'row', alignItems: 'center' },
  lessonPromptIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  roundArrow: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.panel3, alignItems: 'center', justifyContent: 'center' },
  segmentRow: { flexDirection: 'row', padding: 4, borderRadius: 12, backgroundColor: C.bg, gap: 4 },
  segment: { flex: 1, minHeight: 37, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  segmentActive: { backgroundColor: C.panel3 },
  segmentText: { color: C.dim, fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
  segmentTextActive: { color: C.text },
  levelSelector: { flexDirection: 'row', gap: 7 },
  levelOption: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 9, gap: 7, backgroundColor: C.panel },
  levelOptionActive: { borderColor: C.amber, backgroundColor: C.panel2 },
  levelOptionLocked: { opacity: 0.5 },
  levelOptionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelOptionIndex: { color: C.dim, fontFamily: 'Outfit_700Bold', fontSize: 10 },
  levelOptionName: { color: C.muted, fontFamily: 'Outfit_600SemiBold', fontSize: 10 },
  recommendedCard: { backgroundColor: C.panel2 },
  recommendedTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recommendedFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  lessonVisual: { height: 128, borderRadius: 14, backgroundColor: '#121C32', overflow: 'hidden', position: 'relative', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', paddingHorizontal: 25 },
  lessonPlayerVisual: { height: 230, borderRadius: 16, backgroundColor: '#121C32', borderWidth: 1, borderColor: C.line, padding: 15, justifyContent: 'space-between', overflow: 'hidden' },
  lessonLaneCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lessonLaneLine: { position: 'absolute', width: 54, height: '100%', backgroundColor: '#1A2944', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#344766' },
  lessonFootsteps: { height: '100%', justifyContent: 'space-between', paddingVertical: 4 },
  lessonFootstep: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.panel3, borderWidth: 1, borderColor: '#52617B', alignItems: 'center', justifyContent: 'center' },
  lessonFootstepActive: { backgroundColor: C.amber, borderColor: C.amber },
  lessonFootstepText: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 11 },
  lessonArrow: { position: 'absolute', right: '29%', top: '42%', transform: [{ rotate: '-90deg' }] },
  lessonVisualCaption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lessonChapterBadge: { color: C.amber, fontFamily: 'Outfit_800ExtraBold', fontSize: 14 },
  chapterProgress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chapterDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: C.panel3 },
  chapterDotActive: { width: 22, backgroundColor: C.amber },
  chapterDotDone: { backgroundColor: C.mint },
  chapterCard: { padding: 16, gap: 14 },
  chapterNumber: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  chapterNumberText: { color: C.amber, fontFamily: 'Outfit_800ExtraBold', fontSize: 16 },
  chapterBody: { color: C.text, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 22 },
  lessonCue: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 11, borderRadius: 11, backgroundColor: C.bg },
  lessonCueText: { flex: 1, color: C.amber, fontFamily: 'Outfit_600SemiBold', fontSize: 11, lineHeight: 16 },
  chapterControls: { flexDirection: 'row', gap: 9 },
  chapterControlButton: { flex: 1 },
  laneStripe: { width: 1, backgroundColor: 'rgba(75,120,255,0.22)' },
  laneBall: { width: 23, height: 23, borderRadius: 12, backgroundColor: C.blue, position: 'absolute', bottom: 17, left: '28%', alignItems: 'center', justifyContent: 'center' },
  laneHole: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#AFC2FF' },
  lanePins: { position: 'absolute', right: 22, top: 23, flexDirection: 'row', gap: 5 },
  lanePinText: { color: '#DCE5FF', fontFamily: 'Outfit_700Bold', fontSize: 15 },
  lessonPlay: { position: 'absolute', width: 42, height: 42, borderRadius: 21, top: 43, left: '47%', backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  lessonList: { gap: 9 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 11 },
  lessonIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  lessonIconDone: { backgroundColor: C.mintSoft },
  lessonDuration: { color: C.amber, fontFamily: 'Outfit_600SemiBold', fontSize: 9, marginTop: 3 },
  checkButton: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  assessmentCard: { backgroundColor: C.panel2 },
  assessmentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center' },
  quizPanel: { gap: 10, paddingTop: 6 },
  quizQuestion: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 18, lineHeight: 24, marginVertical: 3 },
  quizChoice: { minHeight: 43, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingHorizontal: 11, borderWidth: 1, borderColor: C.line, borderRadius: 11, backgroundColor: C.bg },
  quizChoiceText: { flex: 1, color: C.muted, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11 },
  searchBar: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: C.line, borderRadius: 12, backgroundColor: C.panel },
  searchInput: { flex: 1, color: C.text, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, paddingVertical: 8 },
  glossaryRow: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line, gap: 4 },
  glossaryTerm: { color: C.amber, fontFamily: 'Outfit_700Bold', fontSize: 13 },
  trainingHero: { backgroundColor: '#142D32', borderColor: '#265044' },
  trainingTarget: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 22, marginTop: 5, marginBottom: 2 },
  goalRing: { width: 63, height: 63, borderRadius: 32, borderWidth: 3, borderColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  goalNumber: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 20, lineHeight: 23 },
  goalCaption: { color: C.mint, fontFamily: 'Outfit_700Bold', fontSize: 7 },
  drillList: { gap: 10 },
  drillCard: { padding: 14 },
  drillTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drillIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  drillBottom: { borderTopWidth: 1, borderTopColor: C.line, marginTop: 4, paddingTop: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drillAction: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 9, backgroundColor: C.panel3 },
  drillActionDone: { backgroundColor: C.mintSoft },
  drillActionText: { color: C.text, fontFamily: 'Outfit_600SemiBold', fontSize: 10 },
  coachInitials: { width: 37, height: 37, borderRadius: 13, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  coachInitialsText: { color: '#CFDAFF', fontFamily: 'Outfit_700Bold', fontSize: 10 },
  matchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  undoButton: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.line },
  undoText: { color: C.muted, fontFamily: 'Outfit_600SemiBold', fontSize: 10 },
  scoreHero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#182542', borderColor: '#344B7A', minHeight: 124 },
  scoreValue: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 55, lineHeight: 60, fontVariant: ['tabular-nums'] },
  scoreHeroBadge: { width: 57, height: 60, borderRadius: 14, backgroundColor: C.amberSoft, alignItems: 'center', justifyContent: 'center', gap: 4 },
  scoreHeroBadgeText: { color: C.amber, fontFamily: 'Outfit_700Bold', fontSize: 7, textAlign: 'center' },
  framesRow: { gap: 7, paddingBottom: 4 },
  frameCard: { width: 62, minHeight: 81, padding: 7, borderWidth: 1, borderColor: C.line, borderRadius: 10, backgroundColor: C.panel, justifyContent: 'space-between' },
  frameCardActive: { borderColor: C.amber, backgroundColor: C.panel2 },
  frameNumber: { color: C.dim, fontFamily: 'Outfit_600SemiBold', fontSize: 9 },
  frameRolls: { flexDirection: 'row', justifyContent: 'flex-end', gap: 2 },
  frameRoll: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 11, width: 17, height: 17, textAlign: 'center', textAlignVertical: 'center', backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' },
  frameTotal: { color: C.text, textAlign: 'right', fontFamily: 'Outfit_700Bold', fontSize: 12, fontVariant: ['tabular-nums'] },
  rollCard: { padding: 14 },
  rollCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pinsBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, backgroundColor: C.amberSoft },
  pinsBadgeText: { color: C.amber, fontFamily: 'Outfit_600SemiBold', fontSize: 9 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  key: { width: '31.7%', height: 57, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.panel3, borderWidth: 1, borderColor: C.line },
  keyStrike: { backgroundColor: C.amberSoft, borderColor: '#805722' },
  keyText: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 19, lineHeight: 22 },
  keyHint: { color: C.dim, fontFamily: 'Outfit_600SemiBold', fontSize: 7, marginTop: 1 },
  resultCard: { borderColor: '#28644D', backgroundColor: '#102B27' },
  resultIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  ruleHint: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 3 },
  profileCard: { padding: 16 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: { width: 57, height: 57, borderRadius: 19, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#405AA2' },
  profilePhoto: { width: 55, height: 55, borderRadius: 18 },
  profileAvatarText: { color: '#D7E0FF', fontFamily: 'Outfit_800ExtraBold', fontSize: 17 },
  profileName: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 17 },
  profileStats: { marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', justifyContent: 'space-around' },
  profileStatValue: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 19, textAlign: 'center' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  historyIcon: { width: 33, height: 33, borderRadius: 11, backgroundColor: C.panel3, alignItems: 'center', justifyContent: 'center' },
  historyScore: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 19, fontVariant: ['tabular-nums'] },
  roleCards: { gap: 8, marginTop: 10 },
  roleCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, gap: 3 },
  roleCardActive: { borderColor: C.amber, backgroundColor: C.panel2 },
  roleCardTitle: { color: C.text, fontFamily: 'Outfit_700Bold', fontSize: 13 },
  coachMetrics: { flexDirection: 'row', padding: 13, borderRadius: 15, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  coachMetric: { flex: 1, alignItems: 'center', gap: 2 },
  coachMetricValue: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 22 },
  reviewDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.amber },
  athleteCard: { gap: 9 },
  athleteTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  athleteProgress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  athleteProgressValue: { color: C.amber, fontFamily: 'Outfit_700Bold', fontSize: 10 },
  athleteActions: { flexDirection: 'row', gap: 8, marginTop: 3 },
  smallButton: { flex: 1, minHeight: 38, paddingHorizontal: 8 },
  plansTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addButton: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue },
  planCard: { padding: 14 },
  planEditor: { backgroundColor: C.panel2 },
  planCardSelected: { borderColor: C.amber },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planTarget: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, borderRadius: 9, backgroundColor: C.bg },
  planTargetText: { color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, flex: 1 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  messageInput: { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 },
  editorDescription: { minHeight: 82, textAlignVertical: 'top', paddingTop: 10 },
  editorLessons: { minHeight: 150, textAlignVertical: 'top', paddingTop: 11, lineHeight: 23 },
  questionEditor: { gap: 9 },
  questionEditorHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  questionNumber: { color: C.amber, fontFamily: 'Outfit_800ExtraBold', fontSize: 13 },
  deleteQuestion: { width: 31, height: 31, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  questionInput: { minHeight: 58, textAlignVertical: 'top', paddingTop: 9 },
  choiceEditorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addChoice: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 3 },
  correctChoice: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: C.dim, alignItems: 'center', justifyContent: 'center' },
  correctChoiceActive: { backgroundColor: C.mint, borderColor: C.mint },
  choiceInput: { flex: 1, minHeight: 39, paddingVertical: 6 },
  feedbackCard: { borderLeftWidth: 3, borderLeftColor: C.amber },
  feedbackTop: { flexDirection: 'row', justifyContent: 'space-between' },
  adminMetricCard: { flexDirection: 'row', justifyContent: 'space-around' },
  adminMetric: { alignItems: 'center', gap: 2 },
  adminMetricValue: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 23 },
  adminRow: { gap: 12 },
  adminPageHeading: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  createModuleButton: { minHeight: 38, paddingHorizontal: 10, marginBottom: 4 },
  adminModuleIcon: { width: 37, height: 37, borderRadius: 11, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  editorAction: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  publishStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishToggle: { width: 44, height: 25, borderRadius: 13, justifyContent: 'center', padding: 3, backgroundColor: C.panel3 },
  publishToggleOn: { backgroundColor: '#326B56' },
  publishKnob: { width: 19, height: 19, borderRadius: 10, backgroundColor: C.muted },
  publishKnobOn: { alignSelf: 'flex-end', backgroundColor: C.mint },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountStatus: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: C.panel3 },
  accountStatusOn: { backgroundColor: C.mintSoft },
  accountStatusText: { color: C.muted, fontFamily: 'Outfit_600SemiBold', fontSize: 9 },
  auditRail: { gap: 1 },
  auditEvent: { minHeight: 83, flexDirection: 'row', gap: 12 },
  auditTimeline: { width: 30, alignItems: 'center' },
  auditDot: { width: 30, height: 30, borderRadius: 11, backgroundColor: C.panel3, alignItems: 'center', justifyContent: 'center' },
  auditLine: { width: 1, flex: 1, backgroundColor: C.line },
  auditBody: { flex: 1, paddingTop: 1, gap: 4 },
  loginContent: { paddingHorizontal: 20, paddingTop: 27, paddingBottom: 30, flexGrow: 1, justifyContent: 'center' },
  loginHero: { alignItems: 'flex-start', marginBottom: 21, gap: 10 },
  loginMark: { width: 69, height: 69, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, position: 'relative', marginBottom: 5 },
  loginMarkText: { color: '#FFFFFF', fontFamily: 'Outfit_800ExtraBold', fontSize: 49, lineHeight: 57 },
  loginOrb: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: C.amber, right: 9, top: 8 },
  loginTitle: { color: C.text, fontFamily: 'Outfit_800ExtraBold', fontSize: 37, lineHeight: 43 },
  loginSub: { color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 19, maxWidth: 300 },
  authCard: { padding: 17, gap: 9 },
  input: { minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, paddingHorizontal: 12, color: C.text, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12 },
  helperText: { color: C.dim, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, lineHeight: 14 },
  errorText: { color: C.red, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, lineHeight: 15 },
  registerLink: { paddingVertical: 11, alignItems: 'center' },
  registerText: { color: C.muted, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10 },
  demoDisclaimer: { color: C.dim, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 2 },
  loginFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 16 },
  loginFootText: { color: C.dim, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9 },
  backLink: { paddingVertical: 12 },
});
