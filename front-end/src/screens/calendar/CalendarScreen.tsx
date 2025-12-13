// src/screens/calendar/CalendarScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

import { colors, spacing, borderRadius } from '../../context/ThemeContext';

type EventCategory = 'meal' | 'workout' | 'appointment';

interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: Date;
  time: string;
  notes?: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Bữa sáng: Yến mạch + trứng',
    category: 'meal',
    date: new Date(2025, 11, 13, 7, 30),
    time: '07:30',
    notes: '380 kcal, 24g protein',
  },
  {
    id: '2',
    title: 'Chạy bộ buổi sáng',
    category: 'workout',
    date: new Date(2025, 11, 13, 6, 0),
    time: '06:00',
    notes: '5km, 30 phút',
  },
  {
    id: '3',
    title: 'Khám sức khỏe định kỳ',
    category: 'appointment',
    date: new Date(2025, 11, 15, 9, 0),
    time: '09:00',
    notes: 'Bệnh viện Đa khoa',
  },
  {
    id: '4',
    title: 'Bữa trưa: Gà nướng quinoa',
    category: 'meal',
    date: new Date(2025, 11, 13, 12, 0),
    time: '12:00',
    notes: '680 kcal, 48g protein',
  },
  {
    id: '5',
    title: 'Gym - Upper body',
    category: 'workout',
    date: new Date(2025, 11, 14, 18, 0),
    time: '18:00',
    notes: 'Ngực, vai, tay',
  },
  {
    id: '6',
    title: 'Bữa tối: Cá hồi khoai lang',
    category: 'meal',
    date: new Date(2025, 11, 14, 19, 30),
    time: '19:30',
    notes: '650 kcal, 45g protein',
  },
  {
    id: '7',
    title: 'Yoga buổi sáng',
    category: 'workout',
    date: new Date(2025, 11, 16, 6, 30),
    time: '06:30',
    notes: '45 phút stretching',
  },
  {
    id: '8',
    title: 'Gặp huấn luyện viên',
    category: 'appointment',
    date: new Date(2025, 11, 17, 10, 0),
    time: '10:00',
    notes: 'Tư vấn chế độ tập',
  },
];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('meal');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case 'meal':
        return '#FF6B6B';
      case 'workout':
        return colors.primary;
      case 'appointment':
        return '#4ECDC4';
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case 'meal':
        return 'restaurant';
      case 'workout':
        return 'barbell';
      case 'appointment':
        return 'calendar';
      default:
        return 'ellipse';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề sự kiện');
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      category: newEventCategory,
      date: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(newEventTime.split(':')[0] || '12'),
        parseInt(newEventTime.split(':')[1] || '0')
      ),
      time: newEventTime || '12:00',
      notes: newEventNotes,
    };

    setEvents([...events, newEvent]);
    setShowAddModal(false);
    
    // Reset form
    setNewEventTitle('');
    setNewEventCategory('meal');
    setNewEventTime('');
    setNewEventNotes('');
    
    Alert.alert('Thành công', 'Đã thêm sự kiện mới!');
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Xóa sự kiện',
      'Bạn có chắc chắn muốn xóa sự kiện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setEvents(events.filter(e => e.id !== eventId));
            setShowEventDetail(false);
            Alert.alert('Đã xóa', 'Sự kiện đã được xóa');
          },
        },
      ]
    );
  };

  const renderCalendarGrid = () => {
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    // Calculate first day offset
    const firstDayOfMonth = monthStart.getDay();
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Add empty cells for offset
    const gridCells = Array(offset).fill(null);
    
    return (
      <View style={styles.calendarGrid}>
        {/* Week day headers */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {gridCells.map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}
          
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isCurrentDay && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !isCurrentMonth && styles.dayTextOtherMonth,
                    isSelected && styles.dayTextSelected,
                    isCurrentDay && !isSelected && styles.dayTextToday,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                
                {dayEvents.length > 0 && (
                  <View style={styles.eventDots}>
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <View
                        key={i}
                        style={[
                          styles.eventDot,
                          { backgroundColor: getCategoryColor(event.category) },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderEventsList = () => {
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => 
      a.time.localeCompare(b.time)
    );

    if (dayEvents.length === 0) {
      return (
        <View style={styles.emptyEvents}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyEventsText}>Không có sự kiện nào</Text>
          <TouchableOpacity
            style={styles.addFirstEventButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addFirstEventText}>Thêm sự kiện</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.eventsList}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsHeaderText}>
            Sự kiện - {format(selectedDate, 'd MMMM yyyy', { locale: vi })}
          </Text>
          <Text style={styles.eventsCount}>{dayEvents.length} sự kiện</Text>
        </View>
        
        {dayEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => {
              setSelectedEvent(event);
              setShowEventDetail(true);
            }}
          >
            <View
              style={[
                styles.eventCategoryIndicator,
                { backgroundColor: getCategoryColor(event.category) },
              ]}
            />
            
            <View style={styles.eventCardContent}>
              <View style={styles.eventCardHeader}>
                <Ionicons
                  name={getCategoryIcon(event.category) as any}
                  size={20}
                  color={getCategoryColor(event.category)}
                />
                <Text style={styles.eventTime}>{event.time}</Text>
              </View>
              
              <Text style={styles.eventTitle}>{event.title}</Text>
              
              {event.notes && (
                <Text style={styles.eventNotes} numberOfLines={1}>
                  {event.notes}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAddEventModal = () => {
    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm sự kiện mới</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Bữa sáng, Chạy bộ, Khám bác sĩ..."
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />

              <Text style={styles.formLabel}>Loại sự kiện</Text>
              <View style={styles.categoryButtons}>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newEventCategory === 'meal' && styles.categoryButtonActive,
                    { borderColor: '#FF6B6B' },
                  ]}
                  onPress={() => setNewEventCategory('meal')}
                >
                  <Ionicons
                    name="restaurant"
                    size={20}
                    color={newEventCategory === 'meal' ? '#fff' : '#FF6B6B'}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newEventCategory === 'meal' && styles.categoryButtonTextActive,
                    ]}
                  >
                    Bữa ăn
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newEventCategory === 'workout' && styles.categoryButtonActive,
                    { borderColor: colors.primary },
                  ]}
                  onPress={() => setNewEventCategory('workout')}
                >
                  <Ionicons
                    name="barbell"
                    size={20}
                    color={newEventCategory === 'workout' ? '#fff' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newEventCategory === 'workout' && styles.categoryButtonTextActive,
                    ]}
                  >
                    Tập luyện
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    newEventCategory === 'appointment' && styles.categoryButtonActive,
                    { borderColor: '#4ECDC4' },
                  ]}
                  onPress={() => setNewEventCategory('appointment')}
                >
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={newEventCategory === 'appointment' ? '#fff' : '#4ECDC4'}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newEventCategory === 'appointment' && styles.categoryButtonTextActive,
                    ]}
                  >
                    Hẹn
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Thời gian</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (VD: 07:30)"
                value={newEventTime}
                onChangeText={setNewEventTime}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.formLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Thêm ghi chú..."
                value={newEventNotes}
                onChangeText={setNewEventNotes}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddEvent}>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Thêm sự kiện</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEventDetailModal = () => {
    if (!selectedEvent) return null;

    return (
      <Modal
        visible={showEventDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết sự kiện</Text>
              <TouchableOpacity onPress={() => setShowEventDetail(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View
                style={[
                  styles.eventDetailCategory,
                  { backgroundColor: getCategoryColor(selectedEvent.category) + '20' },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(selectedEvent.category) as any}
                  size={32}
                  color={getCategoryColor(selectedEvent.category)}
                />
              </View>

              <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>

              <View style={styles.eventDetailRow}>
                <Ionicons name="time" size={20} color={colors.textSecondary} />
                <Text style={styles.eventDetailText}>
                  {format(selectedEvent.date, 'd MMMM yyyy', { locale: vi })} • {selectedEvent.time}
                </Text>
              </View>

              {selectedEvent.notes && (
                <View style={styles.eventDetailRow}>
                  <Ionicons name="document-text" size={20} color={colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{selectedEvent.notes}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteEvent(selectedEvent.id)}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Xóa sự kiện</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.monthTitle}>
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Grid */}
        {renderCalendarGrid()}

        {/* Events List */}
        {renderEventsList()}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      {renderAddEventModal()}
      {renderEventDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  
  // Calendar Grid
  calendarGrid: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  dayCellToday: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dayTextOtherMonth: {
    color: colors.textSecondary,
    opacity: 0.4,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  
  // Events List
  emptyEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyEventsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addFirstEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  addFirstEventText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  eventsList: {
    padding: spacing.md,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  eventsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventCategoryIndicator: {
    width: 4,
  },
  eventCardContent: {
    flex: 1,
    padding: spacing.md,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventNotes: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Event Detail Modal
  eventDetailCategory: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  eventDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventDetailText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FF3B30',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
