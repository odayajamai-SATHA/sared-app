import { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const isArabic = this.props.isRTL;
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>
            {isArabic ? 'حدث خطأ ما' : 'Something went wrong'}
          </Text>
          <Text style={styles.subtitle}>
            {isArabic
              ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.'
              : "We're sorry for the inconvenience. Please try again."}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry}>
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryText}>
              {isArabic ? 'إعادة المحاولة' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
